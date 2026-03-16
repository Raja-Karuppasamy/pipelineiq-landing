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
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get individual workflow costs
  const { data: costs } = await supabase
    .from("workflow_costs")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  // Get daily rollups for chart
  const { data: rollups } = await supabase
    .from("cost_rollups")
    .select("*")
    .eq("period_type", "daily")
    .gte("period_start", since.toISOString().split("T")[0])
    .order("period_start", { ascending: true });

  // Summary stats
  const totalCost = costs?.reduce((sum, c) => sum + Number(c.cost_usd), 0) || 0;
  const totalMinutes = costs?.reduce((sum, c) => sum + Number(c.billable_minutes), 0) || 0;
  const totalRuns = costs?.length || 0;
  const wasteRuns = costs?.filter(c => c.waste_flag).length || 0;
  const wasteCost = costs?.filter(c => c.waste_flag).reduce((sum, c) => sum + Number(c.cost_usd), 0) || 0;

  // Top repos by cost
  const repoCosts: Record<string, { cost: number; runs: number; minutes: number }> = {};
  costs?.forEach(c => {
    const repo = c.repo_full_name;
    if (!repoCosts[repo]) repoCosts[repo] = { cost: 0, runs: 0, minutes: 0 };
    repoCosts[repo].cost += Number(c.cost_usd);
    repoCosts[repo].runs += 1;
    repoCosts[repo].minutes += Number(c.billable_minutes);
  });

  const topRepos = Object.entries(repoCosts)
    .map(([repo, data]) => ({ repo, ...data }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  return NextResponse.json({
    costs,
    rollups,
    topRepos,
    summary: { totalCost, totalMinutes, totalRuns, wasteRuns, wasteCost },
  });
}