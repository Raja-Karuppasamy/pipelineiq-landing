"use client";

import React, { useEffect, useState } from "react";

interface Incident {
  id: string;
  repo_full_name: string;
  title: string;
  severity: string;
  status: string;
  error_summary: string | null;
  commit_sha: string | null;
  commit_message: string | null;
  triggered_by: string | null;
  branch: string | null;
  detected_at: string;
  resolved_at: string | null;
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
  total: number;
  openCount: number;
  resolvedCount: number;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    low: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
    medium: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
    high: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
    critical: { bg: "rgba(220,38,38,0.2)", text: "#fca5a5" },
  };
  const s = styles[severity] || styles.medium;
  return React.createElement("span", {
    style: {
      fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
      background: s.bg, color: s.text, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600,
    }
  }, severity);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    open: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
    resolved: { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
    ignored: { bg: "rgba(107,114,128,0.15)", text: "#9ca3af" },
  };
  const s = styles[status] || styles.open;
  return React.createElement("span", {
    style: {
      fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
      background: s.bg, color: s.text, fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600,
    }
  }, status);
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

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const repoName = incident.repo_full_name.split("/").pop() || incident.repo_full_name;
  const run = incident.pipeline_runs;

  return React.createElement("div", {
    style: {
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
      background: incident.status === "open" ? "rgba(239,68,68,0.03)" : "rgba(255,255,255,0.02)",
      overflow: "hidden", cursor: "pointer",
      borderLeft: incident.status === "open" ? "3px solid #ef4444" : "3px solid rgba(255,255,255,0.06)",
    },
    onClick: () => setExpanded(!expanded),
  },
    // Main row
    React.createElement("div", { style: { padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" } },
      // Icon
      React.createElement("div", {
        style: {
          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
          background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }
      }, "⚠"),

      // Info
      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" } },
          React.createElement("span", { style: { color: "white", fontSize: "14px", fontWeight: 600 } }, repoName),
          React.createElement("span", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px" } }, incident.branch || "main"),
          React.createElement(SeverityBadge, { severity: incident.severity }),
          React.createElement(StatusBadge, { status: incident.status }),
        ),
        React.createElement("p", {
          style: { color: "rgba(255,255,255,0.4)", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
        }, incident.error_summary || incident.title),
      ),

      // Meta
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 } },
        React.createElement("span", { style: { color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "monospace" } },
          incident.triggered_by || "unknown"
        ),
        React.createElement("span", { style: { color: "rgba(255,255,255,0.25)", fontSize: "11px" } },
          getTimeAgo(incident.detected_at)
        ),
      ),
    ),

    // Expanded
    expanded ? React.createElement("div", {
      style: { padding: "0 20px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" },
    },
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" } },
        // Error details
        React.createElement("div", null,
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" } }, "Error Details"),
          React.createElement("div", {
            style: { padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", fontFamily: "monospace", fontSize: "12px", color: "#fca5a5", lineHeight: 1.6 }
          }, incident.error_summary || "No error details available"),
          incident.commit_message ? React.createElement("div", { style: { marginTop: "12px" } },
            React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" } }, "Commit"),
            React.createElement("p", { style: { fontSize: "12px", color: "rgba(255,255,255,0.6)" } }, incident.commit_message.split("\n")[0]),
          ) : null,
        ),

        // Run details
        React.createElement("div", null,
          React.createElement("p", { style: { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" } }, "Run Details"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" } },
            ...[
              { label: "Workflow", value: run?.workflow_name || "—" },
              { label: "Commit", value: (incident.commit_sha || "").substring(0, 7) || "—", mono: true },
              { label: "Branch", value: incident.branch || "—" },
              { label: "Triggered by", value: incident.triggered_by || "—" },
              { label: "Detected", value: new Date(incident.detected_at).toLocaleString() },
            ].map((row) =>
              React.createElement("div", { key: row.label, style: { display: "flex", justifyContent: "space-between" } },
                React.createElement("span", { style: { color: "rgba(255,255,255,0.4)" } }, row.label),
                React.createElement("span", { style: { color: row.mono ? "#3b82f6" : "rgba(255,255,255,0.7)", fontFamily: row.mono ? "monospace" : "inherit" } }, row.value),
              )
            ),
            run?.html_url ? React.createElement("a", {
              href: run.html_url, target: "_blank", rel: "noopener noreferrer",
              style: { color: "#3b82f6", fontSize: "11px", marginTop: "4px" },
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
            }, "View on GitHub →") : null,
          ),
        ),
      ),
    ) : null,
  );
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, openCount: 0, resolvedCount: 0 });
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "30" });
    if (filter) params.set("status", filter);
    const res = await fetch("/api/incidents?" + params);
    const data = await res.json();
    setIncidents(data.incidents || []);
    setSummary(data.summary || { total: 0, openCount: 0, resolvedCount: 0 });
    setLoading(false);
  }

  const filters = [
    { label: "All", value: null },
    { label: "Open", value: "open" },
    { label: "Resolved", value: "resolved" },
    { label: "Ignored", value: "ignored" },
  ];

  return React.createElement("div", null,
    // Header
    React.createElement("div", { style: { marginBottom: "24px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" } },
        React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Incidents"),
        React.createElement("span", {
          style: {
            fontSize: "10px", padding: "2px 8px", borderRadius: "9999px",
            background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)",
            fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em",
          }
        }, "After Failure"),
      ),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Auto-generated failure timelines for postmortems"),
    ),

    // Summary cards
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" } },
      ...[
        { label: "Total Incidents", value: String(summary.total), color: "white" },
        { label: "Open", value: String(summary.openCount), color: summary.openCount > 0 ? "#ef4444" : "#10b981" },
        { label: "Resolved", value: String(summary.resolvedCount), color: "#10b981" },
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
            border: "1px solid " + (filter === f.value ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"),
            background: filter === f.value ? "rgba(239,68,68,0.1)" : "transparent",
            color: filter === f.value ? "#f87171" : "rgba(255,255,255,0.5)",
            cursor: "pointer",
          },
        }, f.label)
      ),
    ),

    // Incident list
    loading
      ? React.createElement("div", { style: { textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" } }, "Loading incidents...")
      : incidents.length === 0
        ? React.createElement("div", {
            style: { textAlign: "center", padding: "60px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", background: "rgba(255,255,255,0.02)" },
          },
            React.createElement("p", { style: { color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "4px" } }, "No incidents"),
            React.createElement("p", { style: { color: "rgba(255,255,255,0.25)", fontSize: "12px" } }, "Incidents are auto-created when deploys fail"),
          )
        : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            ...incidents.map((incident) =>
              React.createElement(IncidentCard, { key: incident.id, incident })
            ),
          ),
  );
}