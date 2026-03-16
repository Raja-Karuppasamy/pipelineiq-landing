import { scoreDeployRisk } from "@/lib/risk/scorer";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { trackWorkflowCost } from "../costs/calculator";
import { sendSlackAlert, buildRiskAlertMessage, buildIncidentAlertMessage } from "../notifications/slack";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function handleWorkflowRunEvent(payload: any) {
  const { action, workflow_run, repository, installation } = payload;

  // Only process completed runs
  if (action !== "completed") return { skipped: true, reason: "not completed" };

  const run = workflow_run;

  // Find the org by matching the repo
  const { data: trackedRepo } = await getSupabase()
    .from("tracked_repos")
    .select("org_id")
    .eq("repo_full_name", repository.full_name)
    .eq("is_active", true)
    .single();

  // If repo isn't tracked, try to find org from installation
  let orgId = trackedRepo?.org_id;

  if (!orgId) {
    // Auto-track: find any org and create a tracked repo entry
    const { data: org } = await getSupabase()
      .from("organizations")
      .select("id")
      .limit(1)
      .single();

    if (!org) return { skipped: true, reason: "no org found" };

    orgId = org.id;

    // Auto-add to tracked repos
    await getSupabase().from("tracked_repos").insert({
      org_id: orgId,
      repo_full_name: repository.full_name,
      github_repo_id: String(repository.id),
      is_active: true,
    });
  }

  // Insert pipeline run
  const { data: pipelineRun, error } = await getSupabase()
    .from("pipeline_runs")
    .insert({
      org_id: orgId,
      repo_full_name: repository.full_name,
      github_run_id: String(run.id),
      branch: run.head_branch,
      commit_sha: run.head_sha,
      commit_message: run.head_commit?.message || null,
      workflow_name: run.name,
      status: run.conclusion || run.status, // success, failure, cancelled, etc.
      duration_seconds: run.run_started_at
        ? Math.round(
            (new Date(run.updated_at).getTime() -
              new Date(run.run_started_at).getTime()) /
              1000
          )
        : 0,
      started_at: run.run_started_at,
      finished_at: run.updated_at,
      triggered_by: run.actor?.login || null,
      runner_os: null, // Not available at workflow level
      html_url: run.html_url,
      head_branch: run.head_branch,
      pr_number: run.pull_requests?.[0]?.number || null,
      metadata: {
        event: run.event,
        run_number: run.run_number,
        run_attempt: run.run_attempt,
        installation_id: installation?.id,
      },
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert pipeline run:", error);
    return { error: error.message };
  }

  // If the run failed, auto-create an incident
  if (run.conclusion === "failure" && pipelineRun) {
    const errorSummary =
      run.head_commit?.message
        ? `Deploy failed after: ${run.head_commit.message.split("\n")[0]}`
        : `Workflow "${run.name}" failed`;

    await getSupabase().from("incidents").insert({
      org_id: orgId,
      pipeline_run_id: pipelineRun.id,
      repo_full_name: repository.full_name,
      title: `${repository.name} — ${run.name} failed`,
      severity: "medium",
      status: "open",
      error_summary: errorSummary,
      commit_sha: run.head_sha,
      commit_message: run.head_commit?.message || null,
      triggered_by: run.actor?.login || null,
      branch: run.head_branch,
    });
  }

  // Score the deploy risk
  // Score the deploy risk
  let riskError = null;
  let riskScore = null;
  if (pipelineRun) {
    try {
      const riskResult = await scoreDeployRisk(pipelineRun.id, orgId, {
        triggeredBy: run.actor?.login || undefined,
        testsPassed: run.conclusion === "success" ? true : run.conclusion === "failure" ? false : null,
        deployHour: new Date(run.run_started_at || run.updated_at).getUTCHours(),
        deployDayOfWeek: new Date(run.run_started_at || run.updated_at).getUTCDay(),
      });
      riskScore = riskResult.score;
    } catch (err: any) {
      riskError = err.message || String(err);
      console.error("Risk scoring failed:", err);
    }
  }

  // Track workflow cost
  let costResult = null;
  if (pipelineRun) {
    try {
      costResult = await trackWorkflowCost(
        pipelineRun.id,
        orgId,
        repository.full_name,
        run.name,
        run.run_started_at
          ? Math.round(
              (new Date(run.updated_at).getTime() -
                new Date(run.run_started_at).getTime()) /
                1000
            )
          : 0,
        null, // runner_os not available at workflow level
        run.run_started_at
      );
    } catch (err: any) {
      console.error("Cost tracking failed:", err);
    }
  }

  // Send Slack alerts
  if (pipelineRun) {
    try {
      const { data: alertConfigs } = await getSupabase()
        .from("alert_configs")
        .select("*")
        .eq("org_id", orgId)
        .eq("is_active", true)
        .eq("channel", "slack");

      if (alertConfigs && alertConfigs.length > 0) {
        for (const config of alertConfigs) {
          if (!config.webhook_url) continue;

          // High risk alert
          if (riskScore && riskScore >= (config.risk_threshold || 80)) {
            await sendSlackAlert(config.webhook_url, buildRiskAlertMessage({
              repoName: repository.full_name,
              score: riskScore,
              riskLevel: riskScore > 70 ? "danger" : "warning",
              commitMessage: run.head_commit?.message?.split("\n")[0] || "No message",
              triggeredBy: run.actor?.login || "unknown",
              branch: run.head_branch || "main",
              htmlUrl: run.html_url,
            }));
          }

          // Incident alert
          if (config.incident_alerts && run.conclusion === "failure") {
            await sendSlackAlert(config.webhook_url, buildIncidentAlertMessage({
              repoName: repository.full_name,
              title: `${repository.name} — ${run.name} failed`,
              errorSummary: run.head_commit?.message?.split("\n")[0] || "Deploy failed",
              triggeredBy: run.actor?.login || "unknown",
              branch: run.head_branch || "main",
              commitMessage: run.head_commit?.message?.split("\n")[0] || "No message",
            }));
          }
        }
      }
    } catch (err) {
      console.error("Slack alerts failed:", err);
    }
  }
  return { success: true, pipeline_run_id: pipelineRun?.id, riskScore, riskError, costResult };

}