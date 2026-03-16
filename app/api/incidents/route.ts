import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("incidents")
    .select(`
      *,
      pipeline_runs (
        workflow_name,
        status,
        branch,
        commit_sha,
        commit_message,
        triggered_by,
        duration_seconds,
        started_at,
        html_url
      )
    `)
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = data?.length || 0;
  const openCount = data?.filter(i => i.status === "open").length || 0;
  const resolvedCount = data?.filter(i => i.status === "resolved").length || 0;

  return NextResponse.json({
    incidents: data,
    summary: { total, openCount, resolvedCount },
  });
}