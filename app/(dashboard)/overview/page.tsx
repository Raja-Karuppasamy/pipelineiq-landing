"use client";

import React, { useEffect, useState } from "react";

interface DeployData {
  summary: { totalDeploys: number; avgScore: number; dangerCount: number; safeCount: number };
  deploys: Array<{
    id: string;
    score: number;
    risk_level: string;
    repo_full_name: string;
    created_at: string;
    pipeline_runs: {
      workflow_name: string;
      status: string;
      commit_message: string;
      triggered_by: string;
    } | null;
  }>;
}

interface CostData {
  summary: { totalCost: number; totalMinutes: number; totalRuns: number; wasteCost: number };
}

function ScoreBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    safe: { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
    warning: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
    danger: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  };
  const c = colors[level] || colors.warning;
  return React.createElement("span", {
    style: {
      background: c.bg, color: c.text, padding: "2px 8px", borderRadius: "10px",
      fontSize: "12px", fontWeight: 700, fontFamily: "monospace",
    }
  }, score);
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

export default function OverviewPage() {
  const [deployData, setDeployData] = useState<DeployData | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [dRes, cRes] = await Promise.all([
        fetch("/api/deploy-guard?limit=5"),
        fetch("/api/cost-tracker?days=30"),
      ]);
      const d = await dRes.json();
      const c = await cRes.json();
      setDeployData(d);
      setCostData(c);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.3)" } }, "Loading dashboard...");
  }

  const ds = deployData?.summary || { totalDeploys: 0, avgScore: 0, dangerCount: 0, safeCount: 0 };
  const cs = costData?.summary || { totalCost: 0, totalMinutes: 0, totalRuns: 0, wasteCost: 0 };
  const recentDeploys = deployData?.deploys || [];

  const scoreColor = ds.avgScore > 70 ? "#ef4444" : ds.avgScore > 40 ? "#f59e0b" : "#10b981";

  return React.createElement("div", null,
    // Header
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("h1", { className: "text-2xl font-bold text-white", style: { marginBottom: "4px" } }, "Dashboard"),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Your CI/CD intelligence at a glance"),
    ),

    // Top stats
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Deploys (7d)", value: String(ds.totalDeploys), color: "white" },
        { label: "Avg Risk Score", value: String(ds.avgScore), color: scoreColor },
        { label: "CI/CD Spend (30d)", value: "$" + cs.totalCost.toFixed(2), color: "white" },
        { label: "Waste", value: "$" + cs.wasteCost.toFixed(2), color: cs.wasteCost > 0 ? "#ef4444" : "#10b981" },
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

    // Two columns
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" } },

      // Recent deploys
      React.createElement("div", {
        style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "20px" },
      },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" } },
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" } }, "Recent Deploys"),
          React.createElement("a", { href: "/deploy-guard", style: { fontSize: "11px", color: "#60a5fa", textDecoration: "none" } }, "View all →"),
        ),
        recentDeploys.length > 0
          ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
              ...recentDeploys.map((d) => {
                const repoName = d.repo_full_name.split("/").pop() || d.repo_full_name;
                const run = d.pipeline_runs;
                return React.createElement("div", {
                  key: d.id,
                  style: {
                    display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
                    borderRadius: "8px", background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  },
                },
                  React.createElement("div", {
                    style: {
                      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                      background: run?.status === "success" ? "#10b981" : "#ef4444",
                    }
                  }),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("p", { style: { fontSize: "13px", color: "white", fontWeight: 500 } }, repoName),
                    React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } },
                      run?.commit_message?.split("\n")[0] || "—"
                    ),
                  ),
                  React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", flexShrink: 0 } }, getTimeAgo(d.created_at)),
                  React.createElement(ScoreBadge, { score: d.score, level: d.risk_level }),
                );
              })
            )
          : React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", padding: "30px 0" } }, "No deploys yet"),
      ),

      // Quick stats panel
      React.createElement("div", {
        style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "20px" },
      },
        React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "16px" } }, "Quick Stats"),

        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } },
          // Risk distribution
          React.createElement("div", null,
            React.createElement("p", { style: { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" } }, "Risk Distribution (7d)"),
            React.createElement("div", { style: { display: "flex", gap: "8px" } },
              ...[
                { label: "Safe", count: ds.safeCount, color: "#10b981" },
                { label: "Warning", count: ds.totalDeploys - ds.safeCount - ds.dangerCount, color: "#f59e0b" },
                { label: "Danger", count: ds.dangerCount, color: "#ef4444" },
              ].map((item) => {
                const pct = ds.totalDeploys > 0 ? (item.count / ds.totalDeploys) * 100 : 0;
                return React.createElement("div", { key: item.label, style: { flex: 1 } },
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
                    React.createElement("span", { style: { fontSize: "11px", color: item.color } }, item.label),
                    React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" } }, item.count),
                  ),
                  React.createElement("div", { style: { height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)" } },
                    React.createElement("div", { style: { width: pct + "%", height: "100%", borderRadius: "2px", background: item.color, minWidth: item.count > 0 ? "4px" : "0" } }),
                  ),
                );
              })
            ),
          ),

          // Divider
          React.createElement("div", { style: { height: "1px", background: "rgba(255,255,255,0.06)" } }),

          // Cost breakdown
          React.createElement("div", null,
            React.createElement("p", { style: { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" } }, "Cost Breakdown (30d)"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
              ...[
                { label: "Total runs", value: String(cs.totalRuns) },
                { label: "Billable minutes", value: String(cs.totalMinutes) + " min" },
                { label: "Total cost", value: "$" + cs.totalCost.toFixed(2) },
                { label: "Wasted", value: "$" + cs.wasteCost.toFixed(2) },
              ].map((row) =>
                React.createElement("div", { key: row.label, style: { display: "flex", justifyContent: "space-between" } },
                  React.createElement("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.4)" } }, row.label),
                  React.createElement("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace" } }, row.value),
                ),
              )
            ),
          ),

          // Divider
          React.createElement("div", { style: { height: "1px", background: "rgba(255,255,255,0.06)" } }),

          // Quick links
          React.createElement("div", { style: { display: "flex", gap: "8px" } },
            ...[
              { label: "Deploy Guard", href: "/deploy-guard", color: "#10b981" },
              { label: "Cost Tracker", href: "/cost-tracker", color: "#f59e0b" },
              { label: "Incidents", href: "/incidents", color: "#ef4444" },
            ].map((link) =>
              React.createElement("a", {
                key: link.label,
                href: link.href,
                style: {
                  flex: 1, padding: "10px", borderRadius: "8px", textAlign: "center",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  color: link.color, fontSize: "12px", fontWeight: 600, textDecoration: "none",
                },
              }, link.label),
            )
          ),
        ),
      ),
    ),
  );
}