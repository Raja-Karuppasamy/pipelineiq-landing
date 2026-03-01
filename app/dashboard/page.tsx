"use client";
import { useState, useEffect } from "react";

const API_BASE = "https://pipelineiq-production-3496.up.railway.app";

interface PipelineRun {
  id: string;
  repo_full_name: string;
  branch: string;
  status: string;
  workflow_name: string;
  commit_message: string;
  duration_seconds: number;
  created_at: string;
}

interface Insight {
  id: string;
  title: string;
  severity: string;
  diagnosis: string;
  recommendation: string;
  confidence: number;
  estimated_time_save_minutes: number;
  created_at: string;
}

interface Stats {
  total_runs: number;
  success_rate: number;
  failed_runs: number;
  avg_duration: number;
}

const severityColor: Record<string, string> = {
  critical: "#ff6b6b",
  high: "#fb923c",
  medium: "#fbbf24",
  low: "#64d8a3",
};

const statusColor: Record<string, string> = {
  success: "#64d8a3",
  failure: "#ff6b6b",
  cancelled: "#64748b",
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dora, setDora] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "runs" | "insights" | "dora">("overview");

  useEffect(() => {
    const saved = localStorage.getItem("piq_api_key");
    if (saved) {
      setApiKey(saved);
    }
  }, []);

  useEffect(() => {
    if (apiKey) fetchData();
  }, [apiKey]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const headers = { "X-PipelineIQ-Key": apiKey };

      const [runsRes, insightsRes, doraRes] = await Promise.all([
  fetch(`${API_BASE}/api/v1/pipelines/runs`, { headers }),
  fetch(`${API_BASE}/api/v1/insights/?limit=20`, { headers }),
  fetch(`${API_BASE}/api/v1/insights/dora`, { headers }),
]);

      if (!runsRes.ok) {
        setError("Invalid API key. Please check and try again.");
        setLoading(false);
        return;
      }

      const runsData = await runsRes.json();
      const insightsData = await insightsRes.json();

      const runsArr = runsData.data?.runs || runsData.data || [];
      const insightsArr = insightsData.data?.insights || insightsData.data || [];
      const doraData = await doraRes.json();
      setDora(doraData.data || null);
      setRuns(runsArr);
      setInsights(insightsArr);

      // Compute stats
      const total = runsArr.length;
      const failed = runsArr.filter((r: PipelineRun) => r.status === "failure").length;
      const success = runsArr.filter((r: PipelineRun) => r.status === "success").length;
      const avgDur = total > 0
        ? Math.round(runsArr.reduce((acc: number, r: PipelineRun) => acc + (r.duration_seconds || 0), 0) / total)
        : 0;

      setStats({
        total_runs: total,
        success_rate: total > 0 ? Math.round((success / total) * 100) : 0,
        failed_runs: failed,
        avg_duration: avgDur,
      });
    } catch (e) {
      setError("Failed to connect to API. Please try again.");
    }
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!inputKey.trim()) return;
    localStorage.setItem("piq_api_key", inputKey.trim());
    setApiKey(inputKey.trim());
  }

  function handleLogout() {
    localStorage.removeItem("piq_api_key");
    setApiKey("");
    setRuns([]);
    setInsights([]);
    setStats(null);
  }

  // Login screen
  if (!apiKey) {
    return (
      <main style={{ minHeight: "100vh", background: "#020812", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::placeholder { color: #334155; }`}</style>
        <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <a href="/" style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 22, color: "#fff", textDecoration: "none" }}>PipelineIQ</a>
            <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Enter your API key to access your dashboard</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="text"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="piq_live_..."
              required
              style={{ padding: "14px 16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 14, color: "#fff", outline: "none" }}
            />
            {error && <p style={{ color: "#ff6b6b", fontSize: 13, fontFamily: "monospace" }}>{error}</p>}
            <button type="submit" style={{ padding: "14px", background: "#64d8a3", color: "#020812", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Access Dashboard →
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#334155", fontFamily: "monospace" }}>
            Don't have an API key? <a href="/" style={{ color: "#64d8a3" }}>Get early access</a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020812", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #0f172a", background: "rgba(2,8,18,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/" style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 16, color: "#fff" }}>PipelineIQ</a>
          <span style={{ color: "#1e293b" }}>|</span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#475569" }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#334155" }}>{apiKey.slice(0, 16)}...</span>
          <button onClick={handleLogout} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #1e293b", borderRadius: 6, color: "#64748b", fontFamily: "monospace", fontSize: 12, cursor: "pointer" }}>
            Sign out
          </button>
          <button onClick={fetchData} style={{ padding: "6px 14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#64d8a3", fontFamily: "monospace", fontSize: 12, cursor: "pointer" }}>
            ↻ Refresh
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px", color: "#475569", fontFamily: "monospace", fontSize: 14 }}>
            Loading pipeline data...
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Runs", value: stats?.total_runs ?? 0, color: "#fff" },
                { label: "Success Rate", value: `${stats?.success_rate ?? 0}%`, color: "#64d8a3" },
                { label: "Failed Runs", value: stats?.failed_runs ?? 0, color: "#ff6b6b" },
                { label: "Avg Duration", value: `${stats?.avg_duration ?? 0}s`, color: "#a78bfa" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "24px", borderRadius: 12, border: "1px solid #0f172a", background: "#020c1a" }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "monospace", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #0f172a", paddingBottom: 0 }}>
              {(["overview", "runs", "insights", "dora"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === tab ? "2px solid #64d8a3" : "2px solid transparent", color: activeTab === tab ? "#64d8a3" : "#475569", fontFamily: "monospace", fontSize: 13, cursor: "pointer", textTransform: "capitalize", marginBottom: -1 }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Recent failures */}
                <div style={{ borderRadius: 12, border: "1px solid #0f172a", background: "#020c1a", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f172a", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 700 }}>
                    🔴 Recent Failures
                  </div>
                  <div style={{ padding: "8px 0" }}>
                    {runs.filter(r => r.status === "failure").slice(0, 5).map((run, i) => (
                      <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid #0a1628", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "monospace", fontSize: 13, color: "#fff", marginBottom: 3 }}>{run.repo_full_name}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>{run.branch} · {run.workflow_name}</div>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{timeAgo(run.created_at)}</div>
                      </div>
                    ))}
                    {runs.filter(r => r.status === "failure").length === 0 && (
                      <div style={{ padding: "24px 20px", fontFamily: "monospace", fontSize: 13, color: "#334155", textAlign: "center" }}>No failures 🎉</div>
                    )}
                  </div>
                </div>

                {/* Recent insights */}
                <div style={{ borderRadius: 12, border: "1px solid #0f172a", background: "#020c1a", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #0f172a", fontFamily: "monospace", fontSize: 13, color: "#fff", fontWeight: 700 }}>
                    🧠 Recent AI Diagnoses
                  </div>
                  <div style={{ padding: "8px 0" }}>
                    {insights.slice(0, 5).map((insight, i) => (
                      <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid #0a1628" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: severityColor[insight.severity] || "#64748b", display: "inline-block" }} />
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#fff" }}>{insight.title}</span>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>
                          {insight.confidence}% confidence · {insight.estimated_time_save_minutes}min saved
                        </div>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <div style={{ padding: "24px 20px", fontFamily: "monospace", fontSize: 13, color: "#334155", textAlign: "center" }}>No insights yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Runs Tab */}
            {activeTab === "runs" && (
              <div style={{ borderRadius: 12, border: "1px solid #0f172a", background: "#020c1a", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #0f172a" }}>
                      {["Repository", "Branch", "Workflow", "Status", "Duration", "Time"].map((h, i) => (
                        <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "monospace", fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #0a1628" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#e2e8f0" }}>{run.repo_full_name}</td>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{run.branch}</td>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{run.workflow_name}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 4, background: `${statusColor[run.status]}20`, color: statusColor[run.status] || "#64748b", fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>
                            {run.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{run.duration_seconds}s</td>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{timeAgo(run.created_at)}</td>
                      </tr>
                    ))}
                    {runs.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", fontFamily: "monospace", fontSize: 13, color: "#334155" }}>No pipeline runs yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === "insights" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{ borderRadius: 12, border: `1px solid ${severityColor[insight.severity]}30`, background: "#020c1a", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 4, background: `${severityColor[insight.severity]}20`, color: severityColor[insight.severity], fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                          {insight.severity}
                        </span>
                        <h3 style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#fff" }}>{insight.title}</h3>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{timeAgo(insight.created_at)}</div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Diagnosis</div>
                      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{insight.diagnosis}</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Recommended Fix</div>
                      <p style={{ fontSize: 13, color: "#64d8a3", lineHeight: 1.65 }}>{insight.recommendation}</p>
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>Confidence: <span style={{ color: "#a78bfa" }}>{insight.confidence}%</span></span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>Time saved: <span style={{ color: "#64d8a3" }}>{insight.estimated_time_save_minutes} min</span></span>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div style={{ padding: "48px", textAlign: "center", fontFamily: "monospace", fontSize: 13, color: "#334155", border: "1px solid #0f172a", borderRadius: 12 }}>
                    No AI diagnoses yet — trigger a pipeline failure to see insights here
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {/* DORA Tab */}
{activeTab === "dora" && dora && (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
    {[
      { key: "deployment_frequency", label: "Deployment Frequency", icon: "🚀", desc: "How often you deploy to production" },
      { key: "change_failure_rate", label: "Change Failure Rate", icon: "💥", desc: "% of deployments causing failures" },
      { key: "mean_time_to_recovery", label: "Mean Time to Recovery", icon: "🔧", desc: "How long to recover from failures" },
      { key: "lead_time", label: "Lead Time", icon: "⏱", desc: "Time from commit to production" },
    ].map((metric, i) => {
      const data = dora[metric.key];
      const ratingColor: Record<string, string> = { elite: "#64d8a3", high: "#a78bfa", medium: "#fbbf24", low: "#ff6b6b" };
      return (
        <div key={i} style={{ borderRadius: 12, border: `1px solid ${ratingColor[data?.rating] || "#0f172a"}30`, background: "#020c1a", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{metric.icon}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#94a3b8" }}>{metric.label}</span>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 4, background: `${ratingColor[data?.rating]}20`, color: ratingColor[data?.rating], fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const }}>
              {data?.rating}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 900, fontFamily: "monospace", color: ratingColor[data?.rating] || "#fff" }}>{data?.value}</span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#475569" }}>{data?.unit}</span>
          </div>
          <p style={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{metric.desc}</p>
        </div>
      );
    })}
    <div style={{ gridColumn: "1 / -1", borderRadius: 12, border: "1px solid #0f172a", background: "#020c1a", padding: "20px 28px", display: "flex", gap: 48 }}>
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", marginBottom: 4 }}>Period</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{dora.period_days} days</div>
      </div>
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", marginBottom: 4 }}>Total Runs</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{dora.total_runs}</div>
      </div>
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", marginBottom: 4 }}>DORA Rating</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#64d8a3" }}>
          {[dora.deployment_frequency?.rating, dora.change_failure_rate?.rating, dora.mean_time_to_recovery?.rating, dora.lead_time?.rating].filter(r => r === "elite").length >= 3 ? "Elite" : "Developing"}
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </main>
  );
}