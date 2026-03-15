import { createClient } from "@supabase/supabase-js";
import { calculateCost } from "./rates";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function trackWorkflowCost(
  pipelineRunId: string,
  orgId: string,
  repoFullName: string,
  workflowName: string,
  durationSeconds: number,
  runnerOs: string | null,
  startedAt: string | null
) {
  const supabase = getSupabase();
  const { minutes, rate, cost } = calculateCost(durationSeconds, runnerOs);
  const os = runnerOs || "Linux";
  const runDate = startedAt ? new Date(startedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  // Check for reruns (same repo + workflow in last 10 minutes)
  const tenMinAgo = new Date();
  tenMinAgo.setMinutes(tenMinAgo.getMinutes() - 10);

  const { data: recentRuns } = await supabase
    .from("workflow_costs")
    .select("id")
    .eq("org_id", orgId)
    .eq("repo_full_name", repoFullName)
    .eq("workflow_name", workflowName)
    .gte("created_at", tenMinAgo.toISOString());

  const isRerun = (recentRuns?.length || 0) > 0;
  const rerunCount = recentRuns?.length || 0;

  // Detect waste
  let wasteFlag: string | null = null;
  if (isRerun && rerunCount >= 3) {
    wasteFlag = "flaky_rerun";
  } else if (minutes > 30) {
    wasteFlag = "long_running";
  }

  // Insert workflow cost
  const { error } = await supabase.from("workflow_costs").insert({
    org_id: orgId,
    pipeline_run_id: pipelineRunId,
    repo_full_name: repoFullName,
    workflow_name: workflowName,
    billable_minutes: minutes,
    runner_os: os,
    rate_per_minute: rate,
    cost_usd: cost,
    is_rerun: isRerun,
    rerun_count: rerunCount,
    is_flaky: wasteFlag === "flaky_rerun",
    waste_flag: wasteFlag,
    run_date: runDate,
  });

  if (error) {
    console.error("Failed to track workflow cost:", error);
    return { error: error.message };
  }

  // Update daily rollup
  await updateRollup(orgId, repoFullName, runDate, minutes, cost, os, wasteFlag ? cost : 0);

  return { cost, minutes, wasteFlag };
}

async function updateRollup(
  orgId: string,
  repoFullName: string,
  runDate: string,
  minutes: number,
  cost: number,
  os: string,
  wasteCost: number
) {
  const supabase = getSupabase();

  // Try to get existing rollup
  const { data: existing } = await supabase
    .from("cost_rollups")
    .select("*")
    .eq("org_id", orgId)
    .eq("repo_full_name", repoFullName)
    .eq("period_type", "daily")
    .eq("period_start", runDate)
    .single();

  const linuxMin = os === "Linux" ? minutes : 0;
  const windowsMin = os === "Windows" ? minutes : 0;
  const macosMin = os === "macOS" ? minutes : 0;

  if (existing) {
    await supabase
      .from("cost_rollups")
      .update({
        total_runs: existing.total_runs + 1,
        total_minutes: Number(existing.total_minutes) + minutes,
        total_cost_usd: Number(existing.total_cost_usd) + cost,
        waste_cost_usd: Number(existing.waste_cost_usd) + wasteCost,
        linux_minutes: Number(existing.linux_minutes) + linuxMin,
        windows_minutes: Number(existing.windows_minutes) + windowsMin,
        macos_minutes: Number(existing.macos_minutes) + macosMin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("cost_rollups").insert({
      org_id: orgId,
      repo_full_name: repoFullName,
      period_type: "daily",
      period_start: runDate,
      total_runs: 1,
      total_minutes: minutes,
      total_cost_usd: cost,
      waste_cost_usd: wasteCost,
      linux_minutes: linuxMin,
      windows_minutes: windowsMin,
      macos_minutes: macosMin,
    });
  }
}