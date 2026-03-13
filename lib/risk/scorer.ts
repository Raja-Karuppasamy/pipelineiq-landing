import { createClient } from "@supabase/supabase-js";
import { RISK_WEIGHTS } from "./weights";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface RiskScoreResult {
  score: number;
  riskLevel: "safe" | "warning" | "danger";
  linesChangedScore: number;
  filesChangedScore: number;
  testResultScore: number;
  timeFactorScore: number;
  authorHistoryScore: number;
}

function scoreLinesChanged(lines: number): number {
  const { thresholds } = RISK_WEIGHTS.linesChanged;
  for (const t of thresholds) {
    if (lines <= t.value) return t.score;
  }
  return RISK_WEIGHTS.linesChanged.maxScore;
}

function scoreFilesChanged(files: number, configFiles: number): number {
  const { thresholds, configFileMultiplier } = RISK_WEIGHTS.filesChanged;
  const effectiveFiles = files + configFiles * (configFileMultiplier - 1);
  for (const t of thresholds) {
    if (effectiveFiles <= t.value) return t.score;
  }
  return RISK_WEIGHTS.filesChanged.maxScore;
}

function scoreTestResults(passed: boolean | null, flaky: number): number {
  const { noTests, allPass, flaky: flakyScore, failed } = RISK_WEIGHTS.testResults;
  if (passed === null) return noTests;
  if (!passed) return failed;
  if (flaky > 0) return flakyScore;
  return allPass;
}

function scoreTimeFactor(hour: number, dayOfWeek: number): number {
  const w = RISK_WEIGHTS.timeFactor;

  // Friday after 3pm UTC
  if (dayOfWeek === 5 && hour >= 15) return w.fridayAfternoonScore;

  // Weekend
  if (w.riskyDays.includes(dayOfWeek)) return w.weekendScore;

  // Late night / early morning
  for (const range of w.riskyHours) {
    if (range.start <= range.end) {
      if (hour >= range.start && hour <= range.end) return range.score;
    } else {
      if (hour >= range.start || hour <= range.end) return range.score;
    }
  }

  return w.normalScore;
}

function scoreAuthorHistory(failureRate: number): number {
  const { thresholds } = RISK_WEIGHTS.authorHistory;
  for (const t of thresholds) {
    if (failureRate <= t.rate) return t.score;
  }
  return RISK_WEIGHTS.authorHistory.maxScore;
}

function getRiskLevel(score: number): "safe" | "warning" | "danger" {
  if (score <= 40) return "safe";
  if (score <= 70) return "warning";
  return "danger";
}

export async function calculateAuthorFailureRate(
  orgId: string,
  triggeredBy: string
): Promise<number> {
  const supabase = getSupabase();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: runs } = await supabase
    .from("pipeline_runs")
    .select("status")
    .eq("org_id", orgId)
    .eq("triggered_by", triggeredBy)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (!runs || runs.length === 0) return 0;

  const failures = runs.filter((r) => r.status === "failure").length;
  return failures / runs.length;
}

export async function scoreDeployRisk(
  pipelineRunId: string,
  orgId: string,
  options?: {
    linesChanged?: number;
    filesChanged?: number;
    configFilesChanged?: number;
    testsPassed?: boolean | null;
    testsFlaky?: number;
    deployHour?: number;
    deployDayOfWeek?: number;
    triggeredBy?: string;
  }
): Promise<RiskScoreResult> {
  const supabase = getSupabase();

  // Get pipeline run data if options not fully provided
  const { data: run } = await supabase
    .from("pipeline_runs")
    .select("*")
    .eq("id", pipelineRunId)
    .single();

  const startedAt = run?.started_at ? new Date(run.started_at) : new Date();
  const hour = options?.deployHour ?? startedAt.getUTCHours();
  const dayOfWeek = options?.deployDayOfWeek ?? startedAt.getUTCDay();
  const lines = options?.linesChanged ?? run?.lines_changed ?? 0;
  const files = options?.filesChanged ?? run?.files_changed ?? 0;
  const configFiles = options?.configFilesChanged ?? 0;
  const testsPassed = options?.testsPassed ?? (run?.status === "success" ? true : run?.status === "failure" ? false : null);
  const testsFlaky = options?.testsFlaky ?? 0;
  const triggeredBy = options?.triggeredBy ?? run?.triggered_by ?? "";

  // Calculate author failure rate
  const authorFailureRate = triggeredBy
    ? await calculateAuthorFailureRate(orgId, triggeredBy)
    : 0;

  // Score each factor
  const linesChangedScore = scoreLinesChanged(lines);
  const filesChangedScore = scoreFilesChanged(files, configFiles);
  const testResultScore = scoreTestResults(testsPassed, testsFlaky);
  const timeFactorScore = scoreTimeFactor(hour, dayOfWeek);
  const authorHistoryScore = scoreAuthorHistory(authorFailureRate);

  const score = Math.min(
    100,
    linesChangedScore + filesChangedScore + testResultScore + timeFactorScore + authorHistoryScore
  );

  const result: RiskScoreResult = {
    score,
    riskLevel: getRiskLevel(score),
    linesChangedScore,
    filesChangedScore,
    testResultScore,
    timeFactorScore,
    authorHistoryScore,
  };

  // Save to deploy_scores
  await supabase.from("deploy_scores").upsert({
    org_id: orgId,
    pipeline_run_id: pipelineRunId,
    repo_full_name: run?.repo_full_name || "",
    score: result.score,
    risk_level: result.riskLevel,
    lines_changed_score: linesChangedScore,
    files_touched_score: filesChangedScore,
    test_result_score: testResultScore,
    time_factor_score: timeFactorScore,
    author_history_score: authorHistoryScore,
    lines_changed: lines,
    files_changed: files,
    config_files_changed: configFiles,
    tests_passed: testsPassed,
    tests_flaky: testsFlaky,
    deploy_hour: hour,
    deploy_day_of_week: dayOfWeek,
    author_failure_rate: authorFailureRate,
  }, { onConflict: "pipeline_run_id" });

  return result;
}