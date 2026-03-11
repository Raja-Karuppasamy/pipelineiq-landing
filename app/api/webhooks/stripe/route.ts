import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const orgId = session.subscription
        ? (await stripe.subscriptions.retrieve(session.subscription as string)).metadata.org_id
        : null;

      if (orgId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const plan = subscription.metadata.plan || "team";

        await supabase.from("subscriptions").upsert({
          org_id: orgId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
          plan,
          status: "active",
          repo_limit: plan === "growth" ? -1 : 10,
          member_limit: plan === "growth" ? -1 : 10,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: "org_id" });

        await supabase
          .from("organizations")
          .update({ plan })
          .eq("id", orgId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const orgId = subscription.metadata.org_id;

      if (orgId) {
        const status = subscription.cancel_at_period_end ? "canceled" : subscription.status;

        await supabase.from("subscriptions").upsert({
          org_id: orgId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
          status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        }, { onConflict: "org_id" });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const orgId = subscription.metadata.org_id;

      if (orgId) {
        await supabase.from("subscriptions").upsert({
          org_id: orgId,
          stripe_subscription_id: subscription.id,
          status: "canceled",
          canceled_at: new Date().toISOString(),
        }, { onConflict: "org_id" });

        await supabase
          .from("organizations")
          .update({ plan: "free" })
          .eq("id", orgId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const orgId = subscription.metadata.org_id;

        if (orgId) {
          await supabase.from("subscriptions").upsert({
            org_id: orgId,
            stripe_subscription_id: subscriptionId,
            status: "past_due",
          }, { onConflict: "org_id" });
        }
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}