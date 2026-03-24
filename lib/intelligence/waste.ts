import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface WasteReport {
  totalCost: number;
  wasteCost: number;
  wastePercent: number;
  sources: WasteSource[];
}

export interface WasteSource {
  type: string;
  label: string;
  cost: number;
  runs: number;
  description: string;
}

export async function calculateCIWaste(
  orgId: string,
  days: number = 30
): Promise<WasteReport> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: costs } = await getSupabase()
    .from("workflow_costs")
    .select("cost_usd, repo_full_name, workflow_name, waste_flag, is_rerun")
    .eq("org_id", orgId)
    .gte("created_at", since.toISOString());

  const { data: runs } = await getSupabase()
    .from("pipeline_runs")
    .select("repo_full_name, workflow_name, status, duration_seconds")
    .eq("org_id", orgId)
    .gte("finished_at", since.toISOString());

  const totalCost = costs?.reduce((sum, c) => sum + Number(c.cost_usd), 0) || 0;

  const sources: WasteSource[] = [];

  // 1. Failed build costs
  const failedRuns = runs?.filter(r => r.status === "failure") || [];
  const failedCost = costs?.filter((c, i) => {
    const matchingRun = runs?.find(r =>
      r.repo_full_name === c.repo_full_name && r.workflow_name === c.workflow_name
    );
    return matchingRun?.status === "failure";
  }) || [];
  const failedTotal = failedCost.reduce((sum, c) => sum + Number(c.cost_usd), 0);

  if (failedRuns.length > 0) {
    sources.push({
      type: "failed_builds",
      label: "Failed Builds",
      cost: failedTotal,
      runs: failedRuns.length,
      description: `${failedRuns.length} failed runs wasted CI minutes`,
    });
  }

  // 2. Flaky reruns
  const flaggedWaste = costs?.filter(c => c.waste_flag) || [];
  const flaggedCost = flaggedWaste.reduce((sum, c) => sum + Number(c.cost_usd), 0);

  if (flaggedWaste.length > 0) {
    sources.push({
      type: "flaky_reruns",
      label: "Flaky Reruns",
      cost: flaggedCost,
      runs: flaggedWaste.length,
      description: `${flaggedWaste.length} runs flagged as wasteful reruns`,
    });
  }

  // 3. Repeated failures on same workflow
  const failGroups: Record<string, number> = {};
  failedRuns.forEach(r => {
    const key = `${r.repo_full_name}::${r.workflow_name}`;
    failGroups[key] = (failGroups[key] || 0) + 1;
  });
  const repeatedFailures = Object.entries(failGroups).filter(([, count]) => count >= 3);
  const repeatedCost = repeatedFailures.reduce(([, count]) => count, 0) * 0.008; // estimate

  if (repeatedFailures.length > 0) {
    const totalRepeated = repeatedFailures.reduce((sum, [, count]) => sum + count, 0);
    sources.push({
      type: "repeated_failures",
      label: "Repeated Failures",
      cost: totalRepeated * 0.008,
      runs: totalRepeated,
      description: `${repeatedFailures.length} workflows failing 3+ times`,
    });
  }

  const wasteCost = sources.reduce((sum, s) => sum + s.cost, 0);
  const wastePercent = totalCost > 0 ? Math.round((wasteCost / totalCost) * 100) : 0;

  sources.sort((a, b) => b.cost - a.cost);

  return { totalCost, wasteCost, wastePercent, sources };
}