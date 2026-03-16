"use client";

import React, { useEffect, useState } from "react";

interface Deploy {
  id: string;
  score: number;
  risk_level: string;
  repo_full_name: string;
  lines_changed_score: number;
  files_touched_score: number;
  test_result_score: number;
  time_factor_score: number;
  author_history_score: number;
  lines_changed: number;
  files_changed: number;
  created_at: string;
  pipeline_runs: {
    workflow_name: string;
    status: string;
    branch: string;
    commit_sha: string;
    commit_message: string;
    triggered_by: string;
    duration_seconds: number;
    started_at: string;
    html_url: string;
  } | null;
}

interface Summary {
  totalDeploys: number;
  avgScore: number;
  dangerCount: number;
  safeCount: number;
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    safe: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
    warning: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
    danger: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  };
  const c = colors[level] || colors.warning;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "2px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
      fontFamily: "monospace",
    }}>{score}</span>
  );
}

function FactorBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct > 75 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
      <span style={{ color: "rgba(255,255,255,0.4)", minWidth: "80px" }}>{label}</span>
      <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "2px", background: color, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace", minWidth: "30px", textAlign: "right" }}>{score}/{max}</span>
    </div>
  );
}

function DeployCard({ deploy }: { deploy: Deploy }) {
  const [expanded, setExpanded] = useState(false);
  const run = deploy.pipeline_runs;
  const timeAgo = getTimeAgo(deploy.created_at);
  const repoName = deploy.repo_full_name.split("/").pop() || deploy.repo_full_name;

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        background: deploy.risk_level === "danger" ? "rgba(239,68,68,0.03)" : "rgba(255,255,255,0.02)",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Status icon */}
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: run?.status === "success" ? "#10b981" : run?.status === "failure" ? "#ef4444" : "#f59e0b",
          flexShrink: 0,
        }} />

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>{repoName}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{run?.branch || "main"}</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {run?.commit_message?.split("\n")[0] || "No commit message"}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace" }}>
            {run?.triggered_by || "unknown"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
            {run?.duration_seconds ? `${run.duration_seconds}s` : "—"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>{timeAgo}</span>
          <ScoreBadge score={deploy.score} level={deploy.risk_level} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: "0 20px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: "12px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Risk Breakdown
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <FactorBar label="Lines" score={deploy.lines_changed_score} max={20} />
                <FactorBar label="Files" score={deploy.files_touched_score} max={20} />
                <FactorBar label="Tests" score={deploy.test_result_score} max={20} />
                <FactorBar label="Timing" score={deploy.time_factor_score} max={20} />
                <FactorBar label="Author" score={deploy.author_history_score} max={20} />
              </div>
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Details
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Workflow</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{run?.workflow_name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Commit</span>
                  <span style={{ color: "#3b82f6", fontFamily: "monospace", fontSize: "11px" }}>
                    {run?.commit_sha?.substring(0, 7) || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Status</span>
                  <span style={{ color: run?.status === "success" ? "#10b981" : "#ef4444" }}>
                    {run?.status || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Lines changed</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{deploy.lines_changed || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Files changed</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{deploy.files_changed || 0}</span>
                </div>
                {run?.html_url && (
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3b82f6", fontSize: "11px", marginTop: "4px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on GitHub →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DeployGuardPage() {
  const [deploys, setDeploys] = useState<Deploy[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalDeploys: 0, avgScore: 0, dangerCount: 0, safeCount: 0 });
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (filter) params.set("risk_level", filter);

    const res = await fetch(`/api/deploy-guard?${params}`);
    const data = await res.json();
    setDeploys(data.deploys || []);
    setSummary(data.summary || { totalDeploys: 0, avgScore: 0, dangerCount: 0, safeCount: 0 });
    setLoading(false);
  }

  const filters = [
    { label: "All", value: null },
    { label: "Danger", value: "danger" },
    { label: "Warning", value: "warning" },
    { label: "Safe", value: "safe" },
  ];

  return React.createElement("div", null,
    // Header
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" } },
        React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Deploy Guard"),
        React.createElement("span", {
          style: {
            fontSize: "10px", padding: "2px 8px", borderRadius: "9999px",
            background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)",
            fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em",
          }
        }, "Live"),
      ),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Risk scores for every push to production"),
    ),

    // Summary cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Deploys (7d)", value: summary.totalDeploys, color: "white" },
        { label: "Avg Score", value: summary.avgScore, color: summary.avgScore > 70 ? "#ef4444" : summary.avgScore > 40 ? "#f59e0b" : "#10b981" },
        { label: "Danger", value: summary.dangerCount, color: "#ef4444" },
        { label: "Safe", value: summary.safeCount, color: "#10b981" },
      ].map((card) =>
        React.createElement("div", {
          key: card.label,
          style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "16px" },
        },
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "8px" } }, card.label),
          React.createElement("p", { style: { fontSize: "28px", fontWeight: 700, color: card.color, fontFamily: "monospace" } }, card.value),
        )
      ),
    ),

    // Filters
    React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" } },
      ...filters.map((f) =>
        React.createElement("button", {
          key: f.label,
          onClick: () => setFilter(f.value),
          style: {
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
            border: "1px solid " + (filter === f.value ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"),
            background: filter === f.value ? "rgba(59,130,246,0.1)" : "transparent",
            color: filter === f.value ? "#60a5fa" : "rgba(255,255,255,0.5)",
            cursor: "pointer",
          },
        }, f.label)
      ),
    ),

    // Deploy list
    loading
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" } }, "Loading deploys...")
      : deploys.length === 0
        ? React.createElement("div", {
            style: { textAlign: "center", padding: "60px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" },
          },
            React.createElement("p", { style: { color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "4px" } }, "No deploys yet"),
            React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px" } }, "Push code to a connected repo to see risk scores"),
          )
        : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            ...deploys.map((deploy) =>
              React.createElement(DeployCard, { key: deploy.id, deploy })
            ),
          ),
  );
}