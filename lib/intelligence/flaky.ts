import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface FlakyPipeline {
  repoFullName: string;
  workflowName: string;
  totalRuns: number;
  flips: number;
  flakiness: number;
  failureRate: number;
  lastStatus: string;
  branch: string;
  recentStatuses: string[];
}

export async function detectFlakyPipelines(
  orgId: string,
  days: number = 7,
  minRuns: number = 4
): Promise<FlakyPipeline[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: runs, error } = await getSupabase()
    .from("pipeline_runs")
    .select("repo_full_name, workflow_name, status, branch, finished_at")
    .eq("org_id", orgId)
    .gte("finished_at", since.toISOString())
    .order("finished_at", { ascending: true });

  if (error || !runs) return [];

  // Group by repo + workflow
  const groups: Record<string, {
    statuses: string[];
    branch: string;
  }> = {};

  for (const run of runs) {
    const key = `${run.repo_full_name}::${run.workflow_name}`;
    if (!groups[key]) {
      groups[key] = { statuses: [], branch: run.branch || "main" };
    }
    groups[key].statuses.push(run.status);
  }

  const flaky: FlakyPipeline[] = [];

  for (const [key, data] of Object.entries(groups)) {
    if (data.statuses.length < minRuns) continue;

    // Count "flips" — status changes from success to failure or vice versa
    let flips = 0;
    for (let i = 1; i < data.statuses.length; i++) {
      const prev = data.statuses[i - 1] === "success" ? "pass" : "fail";
      const curr = data.statuses[i] === "success" ? "pass" : "fail";
      if (prev !== curr) flips++;
    }

    // Flakiness score: flips / (total - 1) * 100
    const flakiness = Math.round((flips / (data.statuses.length - 1)) * 100);
    const failures = data.statuses.filter(s => s !== "success").length;
    const failureRate = Math.round((failures / data.statuses.length) * 100);

    // Only flag if flakiness is significant (alternating pattern)
    if (flakiness >= 30) {
      const [repoFullName, workflowName] = key.split("::");
      flaky.push({
        repoFullName,
        workflowName,
        totalRuns: data.statuses.length,
        flips,
        flakiness,
        failureRate,
        lastStatus: data.statuses[data.statuses.length - 1],
        branch: data.branch,
        recentStatuses: data.statuses.slice(-10),
      });
    }
  }

  flaky.sort((a, b) => b.flakiness - a.flakiness);

  return flaky;
}