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

interface Summary {
  totalPatterns: number;
  totalRecurringFailures: number;
  mostAffectedRepo: string | null;
  timeframeDays: number;
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

function FailureRateBar({ rate }: { rate: number }) {
  const color = rate > 60 ? "#ef4444" : rate > 30 ? "#f59e0b" : "#3b82f6";
  return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
    React.createElement("div", { style: { flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)" } },
      React.createElement("div", { style: { width: rate + "%", height: "100%", borderRadius: "3px", background: color, transition: "width 0.5s" } }),
    ),
    React.createElement("span", { style: { fontSize: "12px", fontFamily: "monospace", color, fontWeight: 700, minWidth: "36px" } }, rate + "%"),
  );
}

function RecurringCard({ failure }: { failure: RecurringFailure }) {
  const [expanded, setExpanded] = useState(false);
  const repoName = failure.repoFullName.split("/").pop() || failure.repoFullName;
  const severityColor = failure.failureRate > 60 ? "#ef4444" : failure.failureRate > 30 ? "#f59e0b" : "#3b82f6";
  const severityLabel = failure.failureRate > 60 ? "CRITICAL" : failure.failureRate > 30 ? "WARNING" : "MONITOR";

  return React.createElement("div", {
    style: {
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
      background: "rgba(255,255,255,0.02)", overflow: "hidden", cursor: "pointer",
      borderLeft: "3px solid " + severityColor,
    },
    onClick: () => setExpanded(!expanded),
  },
    // Main row
    React.createElement("div", { style: { padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" } },
      React.createElement("div", {
        style: {
          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
          background: severityColor + "15", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }
      }, "🔁"),

      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" } },
          React.createElement("span", { style: { color: "white", fontSize: "14px", fontWeight: 600 } }, repoName),
          React.createElement("span", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, failure.workflowName),
          React.createElement("span", {
            style: {
              fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
              background: severityColor + "20", color: severityColor,
              fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600,
            }
          }, severityLabel),
        ),
        React.createElement("p", { style: { color: "rgba(255,255,255,0.4)", fontSize: "12px" } },
          failure.failureCount + " failures in " + failure.totalRuns + " runs · last " + getTimeAgo(failure.lastFailure)
        ),
      ),

      React.createElement("div", { style: { width: "120px", flexShrink: 0 } },
        React.createElement(FailureRateBar, { rate: failure.failureRate }),
      ),
    ),

    // Expanded
    expanded ? React.createElement("div", {
      style: { padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" },
    },
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" } },
        // Stats
        React.createElement("div", null,
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" } }, "Pattern Details"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" } },
            ...[
              { label: "Total runs", value: String(failure.totalRuns) },
              { label: "Failures", value: String(failure.failureCount) },
              { label: "Failure rate", value: failure.failureRate + "%" },
              { label: "Branch", value: failure.branch },
              { label: "Authors", value: failure.triggeredBy.join(", ") },
            ].map((row) =>
              React.createElement("div", { key: row.label, style: { display: "flex", justifyContent: "space-between" } },
                React.createElement("span", { style: { color: "rgba(255,255,255,0.4)" } }, row.label),
                React.createElement("span", { style: { color: "rgba(255,255,255,0.7)", fontFamily: "monospace" } }, row.value),
              )
            ),
          ),
        ),

        // Common commit messages
        React.createElement("div", null,
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" } }, "Recent Failing Commits"),
          failure.commonCommitMessages.length > 0
            ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                ...failure.commonCommitMessages.map((msg, i) =>
                  React.createElement("div", {
                    key: i,
                    style: {
                      padding: "6px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.3)",
                      fontSize: "11px", color: "#fca5a5", fontFamily: "monospace",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    },
                  }, msg)
                ),
              )
            : React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px" } }, "No commit messages"),
        ),
      ),
    ) : null,
  );
}

export default function IntelligencePage() {
  const [recurring, setRecurring] = useState<RecurringFailure[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalPatterns: 0, totalRecurringFailures: 0, mostAffectedRepo: null, timeframeDays: 7 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchData();
  }, [days]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/intelligence/recurring?days=${days}&min=2`);
    const data = await res.json();
    setRecurring(data.recurring || []);
    setSummary(data.summary || { totalPatterns: 0, totalRecurringFailures: 0, mostAffectedRepo: null, timeframeDays: days });
    setLoading(false);
  }

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
        }, "Patterns"),
      ),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Automatically detected failure patterns across your repos"),
    ),

    // Summary cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Recurring Patterns", value: String(summary.totalPatterns), color: summary.totalPatterns > 0 ? "#f59e0b" : "#10b981" },
        { label: "Total Recurring Failures", value: String(summary.totalRecurringFailures), color: summary.totalRecurringFailures > 0 ? "#ef4444" : "#10b981" },
        { label: "Most Affected", value: summary.mostAffectedRepo || "None", color: "white" },
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
    React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" } },
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
        }, d + "d")
      ),
    ),

    // Results
    loading
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" } }, "Analyzing patterns...")
      : recurring.length === 0
        ? React.createElement("div", {
            style: { textAlign: "center", padding: "60px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" },
          },
            React.createElement("div", { style: { fontSize: "32px", marginBottom: "12px" } }, "✨"),
            React.createElement("p", { style: { color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "4px" } }, "No recurring failure patterns detected"),
            React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px" } }, "When workflows fail repeatedly, patterns will appear here"),
          )
        : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            ...recurring.map((failure, i) =>
              React.createElement(RecurringCard, { key: i, failure })
            ),
          ),
  );
}