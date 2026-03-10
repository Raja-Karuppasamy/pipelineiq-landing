import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, handleWorkflowRunEvent } from "@/lib/github/webhooks";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature)) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(payload);

  console.log(`GitHub webhook received: ${event} — ${body.action || "no action"}`);

  // Route by event type
  switch (event) {
    case "workflow_run":
      const result = await handleWorkflowRunEvent(body);
      return NextResponse.json(result, { status: 200 });

    case "ping":
      return NextResponse.json({ message: "pong" }, { status: 200 });

    default:
      return NextResponse.json(
        { message: `Event ${event} received but not handled` },
        { status: 200 }
      );
  }
}
