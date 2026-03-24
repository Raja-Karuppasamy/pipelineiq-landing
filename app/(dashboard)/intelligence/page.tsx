"use client";

import React, { useEffect, useState } from "react";

interface RecurringFailure {
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

interface FlakyPipeline {
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

interface WasteSource {
  type: string;
  label: string;
  cost: number;
  runs: number;
  description: string;
}

interface WasteReport {
  totalCost: number;
  wasteCost: number;
  wastePercent: number;
  sources: WasteSource[];
}

function getTimeAgo(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  return Math.floor(hours / 24) + "d ago";
}

function StatusDot({ status }: { status: string }) {
  const color = status === "success" ? "#10b981" : "#ef4444";
  return React.createElement("div", {
    style: { width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }
  });
}

function StatusTimeline({ statuses }: { statuses: string[] }) {
  return React.createElement("div", { style: { display: "flex", gap: "3px", alignItems: "center" } },
    ...statuses.map((s, i) =>
      React.createElement("div", {
        key: i,
        style: {
          width: "10px", height: "14px", borderRadius: "2px",
          background: s === "success" ? "#10b981" : "#ef4444",
          opacity: 0.6 + (i / statuses.length) * 0.4,
        },
      })
    ),
  );
}

export default function IntelligencePage() {
  const [recurring, setRecurring] = useState<RecurringFailure[]>([]);
  const [flaky, setFlaky] = useState<FlakyPipeline[]>([]);
  const [waste, setWaste] = useState<WasteReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [expandedRecurring, setExpandedRecurring] = useState<number | null>(null);
  const [expandedFlaky, setExpandedFlaky] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, [days]);

  async function fetchAll() {
    setLoading(true);
    const [recRes, flakyRes, wasteRes] = await Promise.all([
      fetch(`/api/intelligence/recurring?days=${days}&min=2`),
      fetch(`/api/intelligence/flaky?days=${days}`),
      fetch(`/api/intelligence/waste?days=${days}`),
    ]);
    const recData = await recRes.json();
    const flakyData = await flakyRes.json();
    const wasteData = await wasteRes.json();
    setRecurring(recData.recurring || []);
    setFlaky(flakyData.flaky || []);
    setWaste(wasteData);
    setLoading(false);
  }

  if (loading) {
    return React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.3)" } }, "Analyzing patterns...");
  }

  const totalIssues = recurring.length + flaky.length;

  return React.createElement("div", null,
    // Header
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" } },
        React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Intelligence"),
        React.createElement("span", {
          style: {
            fontSize: "10px", padding: "2px 8px", borderRadius: "9999px",
            background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)",
            fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em",
          }
        }, "AI Patterns"),
      ),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Automatically detected failure patterns, flaky pipelines, and CI waste"),
    ),

    // Top summary cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Patterns Found", value: String(totalIssues), color: totalIssues > 0 ? "#f59e0b" : "#10b981" },
        { label: "Recurring Failures", value: String(recurring.length), color: recurring.length > 0 ? "#ef4444" : "#10b981" },
        { label: "Flaky Pipelines", value: String(flaky.length), color: flaky.length > 0 ? "#f59e0b" : "#10b981" },
        { label: "CI Waste", value: waste ? "$" + waste.wasteCost.toFixed(2) : "$0.00", color: waste && waste.wasteCost > 0 ? "#ef4444" : "#10b981" },
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

    // Timeframe selector
    React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "24px" } },
      ...[7, 14, 30].map((d) =>
        React.createElement("button", {
          key: d,
          onClick: () => setDays(d),
          style: {
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
            border: "1px solid " + (days === d ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"),
            background: days === d ? "rgba(139,92,246,0.1)" : "transparent",
            color: days === d ? "#a78bfa" : "rgba(255,255,255,0.5)",
            cursor: "pointer",
          },
        }, d + " days")
      ),
    ),

    // CI Waste section
    waste && waste.sources.length > 0 ? React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
        React.createElement("span", { style: { fontSize: "16px" } }, "💸"),
        React.createElement("h2", { style: { fontSize: "16px", fontWeight: 600, color: "white" } }, "CI Waste Report"),
        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" } },
          waste.wastePercent + "% of total spend"
        ),
      ),
      React.createElement("div", {
        style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "20px" },
      },
        // Waste bar
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" } },
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } },
              React.createElement("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.5)" } }, "Total: $" + waste.totalCost.toFixed(2)),
              React.createElement("span", { style: { fontSize: "12px", color: "#ef4444", fontWeight: 700 } }, "Waste: $" + waste.wasteCost.toFixed(2)),
            ),
            React.createElement("div", { style: { height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)" } },
              React.createElement("div", { style: { width: waste.wastePercent + "%", height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #ef4444, #f59e0b)", minWidth: waste.wastePercent > 0 ? "4px" : "0" } }),
            ),
          ),
        ),
        // Waste sources
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
          ...waste.sources.map((source, i) =>
            React.createElement("div", {
              key: i,
              style: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" },
            },
              React.createElement("div", {
                style: { width: "28px", height: "28px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 },
              }, source.type === "failed_builds" ? "💥" : source.type === "flaky_reruns" ? "🔄" : "🔁"),
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("p", { style: { fontSize: "13px", color: "white", fontWeight: 500 } }, source.label),
                React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.35)" } }, source.description),
              ),
              React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } },
                React.createElement("p", { style: { fontSize: "13px", color: "#ef4444", fontFamily: "monospace", fontWeight: 700 } }, "$" + source.cost.toFixed(3)),
                React.createElement("p", { style: { fontSize: "10px", color: "rgba(255,255,255,0.3)" } }, source.runs + " runs"),
              ),
            )
          ),
        ),
      ),
    ) : null,

    // Recurring Failures section
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
        React.createElement("span", { style: { fontSize: "16px" } }, "🔁"),
        React.createElement("h2", { style: { fontSize: "16px", fontWeight: 600, color: "white" } }, "Recurring Failures"),
        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" } },
          recurring.length + " patterns"
        ),
      ),
      recurring.length > 0
        ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            ...recurring.map((failure, i) => {
              const repoName = failure.repoFullName.split("/").pop() || failure.repoFullName;
              const severityColor = failure.failureRate > 60 ? "#ef4444" : failure.failureRate > 30 ? "#f59e0b" : "#3b82f6";
              const severityLabel = failure.failureRate > 60 ? "CRITICAL" : failure.failureRate > 30 ? "WARNING" : "MONITOR";
              const expanded = expandedRecurring === i;

              return React.createElement("div", {
                key: i,
                style: {
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
                  background: "rgba(255,255,255,0.02)", overflow: "hidden", cursor: "pointer",
                  borderLeft: "3px solid " + severityColor,
                },
                onClick: () => setExpandedRecurring(expanded ? null : i),
              },
                React.createElement("div", { style: { padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" } },
                  React.createElement("span", { style: { fontSize: "14px" } }, "🔁"),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" } },
                      React.createElement("span", { style: { color: "white", fontSize: "13px", fontWeight: 600 } }, repoName),
                      React.createElement("span", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, failure.workflowName),
                      React.createElement("span", {
                        style: { fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: severityColor + "20", color: severityColor, fontFamily: "monospace", textTransform: "uppercase", fontWeight: 600 },
                      }, severityLabel),
                    ),
                    React.createElement("p", { style: { color: "rgba(255,255,255,0.35)", fontSize: "11px" } },
                      failure.failureCount + " failures in " + failure.totalRuns + " runs · " + failure.failureRate + "% failure rate"
                    ),
                  ),
                ),
                expanded ? React.createElement("div", {
                  style: { padding: "0 20px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" },
                },
                  React.createElement("p", { style: { fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" } }, "Failing Commits"),
                  React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                    ...failure.commonCommitMessages.map((msg, j) =>
                      React.createElement("div", {
                        key: j,
                        style: { padding: "4px 8px", borderRadius: "4px", background: "rgba(0,0,0,0.3)", fontSize: "11px", color: "#fca5a5", fontFamily: "monospace" },
                      }, msg)
                    ),
                  ),
                ) : null,
              );
            })
          )
        : React.createElement("div", {
            style: { padding: "30px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" },
          },
            React.createElement("p", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, "No recurring failure patterns detected"),
          ),
    ),

    // Flaky Pipelines section
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
        React.createElement("span", { style: { fontSize: "16px" } }, "🎲"),
        React.createElement("h2", { style: { fontSize: "16px", fontWeight: 600, color: "white" } }, "Flaky Pipelines"),
        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" } },
          flaky.length + " detected"
        ),
      ),
      flaky.length > 0
        ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            ...flaky.map((pipeline, i) => {
              const repoName = pipeline.repoFullName.split("/").pop() || pipeline.repoFullName;
              const flakyColor = pipeline.flakiness > 60 ? "#ef4444" : pipeline.flakiness > 40 ? "#f59e0b" : "#3b82f6";
              const expanded = expandedFlaky === i;

              return React.createElement("div", {
                key: i,
                style: {
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
                  background: "rgba(255,255,255,0.02)", overflow: "hidden", cursor: "pointer",
                  borderLeft: "3px solid " + flakyColor,
                },
                onClick: () => setExpandedFlaky(expanded ? null : i),
              },
                React.createElement("div", { style: { padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" } },
                  React.createElement("span", { style: { fontSize: "14px" } }, "🎲"),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" } },
                      React.createElement("span", { style: { color: "white", fontSize: "13px", fontWeight: 600 } }, repoName),
                      React.createElement("span", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, pipeline.workflowName),
                      React.createElement("span", {
                        style: { fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: flakyColor + "20", color: flakyColor, fontFamily: "monospace", fontWeight: 700 },
                      }, pipeline.flakiness + "% flaky"),
                    ),
                    React.createElement("p", { style: { color: "rgba(255,255,255,0.35)", fontSize: "11px" } },
                      pipeline.flips + " status flips in " + pipeline.totalRuns + " runs"
                    ),
                  ),
                  React.createElement("div", { style: { flexShrink: 0 } },
                    React.createElement(StatusTimeline, { statuses: pipeline.recentStatuses }),
                  ),
                ),
                expanded ? React.createElement("div", {
                  style: { padding: "0 20px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" },
                },
                  React.createElement("div", { style: { display: "flex", gap: "24px", fontSize: "12px" } },
                    ...[
                      { label: "Total runs", value: String(pipeline.totalRuns) },
                      { label: "Flips", value: String(pipeline.flips) },
                      { label: "Failure rate", value: pipeline.failureRate + "%" },
                      { label: "Branch", value: pipeline.branch },
                      { label: "Last status", value: pipeline.lastStatus },
                    ].map((item) =>
                      React.createElement("div", { key: item.label },
                        React.createElement("p", { style: { color: "rgba(255,255,255,0.3)", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" } }, item.label),
                        React.createElement("p", { style: { color: "rgba(255,255,255,0.7)", fontFamily: "monospace" } }, item.value),
                      )
                    ),
                  ),
                ) : null,
              );
            })
          )
        : React.createElement("div", {
            style: { padding: "30px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" },
          },
            React.createElement("p", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, "No flaky pipelines detected — your CI is stable!"),
          ),
    ),
  );
}