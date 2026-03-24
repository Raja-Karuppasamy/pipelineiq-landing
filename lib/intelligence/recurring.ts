import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface RecurringFailure {
  repoFullName: string;
  workflowName: string;
  failureCount: number;
  totalRuns: number;
  failureRate: number;
  lastFailure: string;
  commonCommitMessages: string[];
  triggeredBy: string[];
  branch: string;
}

export async function detectRecurringFailures(
  orgId: string,
  days: number = 7,
  minFailures: number = 2
): Promise<RecurringFailure[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all runs in the timeframe
  const { data: runs, error } = await getSupabase()
    .from("pipeline_runs")
    .select("repo_full_name, workflow_name, status, commit_message, triggered_by, branch, finished_at")
    .eq("org_id", orgId)
    .gte("finished_at", since.toISOString())
    .order("finished_at", { ascending: false });

  if (error || !runs) return [];

  // Group by repo + workflow
  const groups: Record<string, {
    total: number;
    failures: number;
    lastFailure: string;
    commitMessages: string[];
    authors: Set<string>;
    branch: string;
  }> = {};

  for (const run of runs) {
    const key = `${run.repo_full_name}::${run.workflow_name}`;

    if (!groups[key]) {
      groups[key] = {
        total: 0,
        failures: 0,
        lastFailure: "",
        commitMessages: [],
        authors: new Set(),
        branch: run.branch || "main",
      };
    }

    groups[key].total++;

    if (run.status === "failure") {
      groups[key].failures++;
      if (!groups[key].lastFailure) {
        groups[key].lastFailure = run.finished_at;
      }
      if (run.commit_message) {
        groups[key].commitMessages.push(run.commit_message.split("\n")[0]);
      }
    }

    if (run.triggered_by) {
      groups[key].authors.add(run.triggered_by);
    }
  }

  // Filter to recurring failures
  const recurring: RecurringFailure[] = [];

  for (const [key, data] of Object.entries(groups)) {
    if (data.failures >= minFailures) {
      const [repoFullName, workflowName] = key.split("::");
      recurring.push({
        repoFullName,
        workflowName,
        failureCount: data.failures,
        totalRuns: data.total,
        failureRate: Math.round((data.failures / data.total) * 100),
        lastFailure: data.lastFailure,
        commonCommitMessages: [...new Set(data.commitMessages)].slice(0, 5),
        triggeredBy: [...data.authors],
        branch: data.branch,
      });
    }
  }

  // Sort by failure count descending
  recurring.sort((a, b) => b.failureCount - a.failureCount);

  return recurring;
}