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
  const limit = parseInt(searchParams.get("limit") || "20");
  const riskLevel = searchParams.get("risk_level");

  let query = supabase
    .from("deploy_scores")
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
    .order("created_at", { ascending: false })
    .limit(limit);

  if (riskLevel) {
    query = query.eq("risk_level", riskLevel);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Summary stats
  const { data: stats } = await supabase
    .from("deploy_scores")
    .select("score, risk_level")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const totalDeploys = stats?.length || 0;
  const avgScore = totalDeploys > 0
    ? Math.round((stats?.reduce((sum, s) => sum + s.score, 0) || 0) / totalDeploys)
    : 0;
  const dangerCount = stats?.filter(s => s.risk_level === "danger").length || 0;
  const safeCount = stats?.filter(s => s.risk_level === "safe").length || 0;

  return NextResponse.json({
    deploys: data,
    summary: { totalDeploys, avgScore, dangerCount, safeCount },
  });
}