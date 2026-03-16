"use client";

import React, { useEffect, useState } from "react";

interface CostEntry {
  id: string;
  repo_full_name: string;
  workflow_name: string;
  billable_minutes: number;
  runner_os: string;
  cost_usd: number;
  waste_flag: string | null;
  is_rerun: boolean;
  run_date: string;
  created_at: string;
}

interface Rollup {
  period_start: string;
  total_cost_usd: number;
  total_runs: number;
  total_minutes: number;
}

interface TopRepo {
  repo: string;
  cost: number;
  runs: number;
  minutes: number;
}

interface Summary {
  totalCost: number;
  totalMinutes: number;
  totalRuns: number;
  wasteRuns: number;
  wasteCost: number;
}

function CostBar({ rollups, maxCost }: { rollups: Rollup[]; maxCost: number }) {
  if (rollups.length === 0) return null;
  return React.createElement("div", {
    style: { display: "flex", alignItems: "flex-end", gap: "4px", height: "120px", padding: "0 4px" }
  },
    ...rollups.map((r, i) => {
      const height = maxCost > 0 ? (Number(r.total_cost_usd) / maxCost) * 100 : 0;
      const day = new Date(r.period_start).toLocaleDateString("en", { month: "short", day: "numeric" });
      return React.createElement("div", {
        key: i,
        style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
      },
        React.createElement("span", {
          style: { fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }
        }, "$" + Number(r.total_cost_usd).toFixed(2)),
        React.createElement("div", {
          style: {
            width: "100%", borderRadius: "3px 3px 0 0",
            height: `${Math.max(height, 4)}%`,
            background: Number(r.total_cost_usd) > maxCost * 0.8
              ? "linear-gradient(to top, #dc2626, #ef4444)"
              : "linear-gradient(to top, #1e40af, #3b82f6)",
            transition: "height 0.5s ease",
          }
        }),
        React.createElement("span", {
          style: { fontSize: "9px", color: "rgba(255,255,255,0.25)" }
        }, day),
      );
    })
  );
}

function WasteBadge({ flag }: { flag: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    flaky_rerun: { text: "Flaky", color: "#f59e0b" },
    long_running: { text: "Slow", color: "#f97316" },
    no_cache: { text: "No Cache", color: "#8b5cf6" },
    duplicate: { text: "Duplicate", color: "#ec4899" },
  };
  const l = labels[flag] || { text: flag, color: "#6b7280" };
  return React.createElement("span", {
    style: {
      fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
      background: l.color + "20", color: l.color, border: "1px solid " + l.color + "40",
      fontFamily: "monospace",
    }
  }, l.text);
}

export default function CostTrackerPage() {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [rollups, setRollups] = useState<Rollup[]>([]);
  const [topRepos, setTopRepos] = useState<TopRepo[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalCost: 0, totalMinutes: 0, totalRuns: 0, wasteRuns: 0, wasteCost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/cost-tracker?days=30");
      const data = await res.json();
      setCosts(data.costs || []);
      setRollups(data.rollups || []);
      setTopRepos(data.topRepos || []);
      setSummary(data.summary || { totalCost: 0, totalMinutes: 0, totalRuns: 0, wasteRuns: 0, wasteCost: 0 });
      setLoading(false);
    }
    fetchData();
  }, []);

  const maxRollupCost = Math.max(...rollups.map(r => Number(r.total_cost_usd)), 0.01);

  if (loading) {
    return React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.3)" } }, "Loading cost data...");
  }

  return React.createElement("div", null,
    // Header
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" } },
        React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Cost Tracker"),
        React.createElement("span", {
          style: {
            fontSize: "10px", padding: "2px 8px", borderRadius: "9999px",
            background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)",
            fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em",
          }
        }, "During Runs"),
      ),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "CI/CD spend visibility by repo, workflow, and team"),
    ),

    // Summary cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Total Spend", value: "$" + summary.totalCost.toFixed(2), color: "white" },
        { label: "Total Minutes", value: String(summary.totalMinutes), color: "white" },
        { label: "Total Runs", value: String(summary.totalRuns), color: "white" },
        { label: "Waste", value: "$" + summary.wasteCost.toFixed(2), color: summary.wasteCost > 0 ? "#ef4444" : "#10b981" },
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

    // Two columns: chart + top repos
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" } },
      // Daily spend chart
      React.createElement("div", {
        style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "20px" },
      },
        React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "16px" } }, "Daily Spend (30d)"),
        rollups.length > 0
          ? React.createElement(CostBar, { rollups, maxCost: maxRollupCost })
          : React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", padding: "40px 0" } }, "No data yet"),
      ),

      // Top repos
      React.createElement("div", {
        style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "20px" },
      },
        React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "16px" } }, "Top Repos by Cost"),
        topRepos.length > 0
          ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } },
              ...topRepos.map((repo, i) => {
                const repoName = repo.repo.split("/").pop() || repo.repo;
                const pct = topRepos[0].cost > 0 ? (repo.cost / topRepos[0].cost) * 100 : 0;
                return React.createElement("div", { key: i },
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
                    React.createElement("span", { style: { fontSize: "13px", color: "white" } }, repoName),
                    React.createElement("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" } },
                      "$" + repo.cost.toFixed(3) + " · " + repo.minutes + "min · " + repo.runs + " runs"
                    ),
                  ),
                  React.createElement("div", { style: { height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)" } },
                    React.createElement("div", { style: { width: pct + "%", height: "100%", borderRadius: "2px", background: "#3b82f6", transition: "width 0.5s" } }),
                  ),
                );
              })
            )
          : React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", padding: "40px 0" } }, "No data yet"),
      ),
    ),

    // Recent runs table
    React.createElement("div", {
      style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", overflow: "hidden" },
    },
      // Table header
      React.createElement("div", {
        style: {
          display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr",
          padding: "10px 20px", background: "rgba(255,255,255,0.03)",
          fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em",
          color: "rgba(255,255,255,0.3)", fontFamily: "monospace",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }
      },
        React.createElement("span", null, "Repository"),
        React.createElement("span", null, "Workflow"),
        React.createElement("span", null, "Minutes"),
        React.createElement("span", null, "OS"),
        React.createElement("span", { style: { textAlign: "right" } }, "Cost"),
        React.createElement("span", { style: { textAlign: "right" } }, "Flag"),
      ),

      // Table rows
      costs.length > 0
        ? React.createElement("div", null,
            ...costs.map((cost, i) => {
              const repoName = cost.repo_full_name.split("/").pop() || cost.repo_full_name;
              return React.createElement("div", {
                key: cost.id,
                style: {
                  display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr",
                  padding: "12px 20px", alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: cost.waste_flag ? "rgba(239,68,68,0.03)" : "transparent",
                },
              },
                React.createElement("span", { style: { color: "white", fontSize: "13px" } }, repoName),
                React.createElement("span", { style: { color: "rgba(255,255,255,0.5)", fontSize: "12px" } }, cost.workflow_name),
                React.createElement("span", { style: { color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: "monospace" } }, String(cost.billable_minutes)),
                React.createElement("span", { style: { color: "rgba(255,255,255,0.4)", fontSize: "11px" } }, cost.runner_os),
                React.createElement("span", { style: { color: "#10b981", fontSize: "12px", fontFamily: "monospace", textAlign: "right" } }, "$" + Number(cost.cost_usd).toFixed(4)),
                React.createElement("span", { style: { textAlign: "right" } },
                  cost.waste_flag ? React.createElement(WasteBadge, { flag: cost.waste_flag }) : null
                ),
              );
            })
          )
        : React.createElement("div", { style: { padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "12px" } }, "No workflow costs recorded yet"),
    ),
  );
}