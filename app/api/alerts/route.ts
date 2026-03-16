import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("alert_configs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configs: data });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();

  const { orgId, channel, webhookUrl, riskThreshold, dailyDigest, incidentAlerts } = body;

  if (!orgId || !channel) {
    return NextResponse.json({ error: "Missing orgId or channel" }, { status: 400 });
  }

  const { data, error } = await supabase.from("alert_configs").upsert({
    org_id: orgId,
    channel,
    webhook_url: webhookUrl || null,
    risk_threshold: riskThreshold || 80,
    daily_digest: dailyDigest !== false,
    incident_alerts: incidentAlerts !== false,
    is_active: true,
  }, { onConflict: "id" }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}