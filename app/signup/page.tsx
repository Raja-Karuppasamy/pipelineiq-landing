"use client";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "https://pipelineiq-production-3496.up.railway.app";

  const handleSignup = async () => {
    if (!name || !email) { setError("Name and email are required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (e) {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bg = "#020812";
  const card = "#0a1628";
  const border = "#0f172a";
  const green = "#64d8a3";
  const muted = "#475569";

  if (done) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: green, marginBottom: 12 }}>Check your email!</h1>
        <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
          Your API key is on its way to <strong style={{ color: "#fff" }}>{email}</strong>.
          Add it to your GitHub Actions workflow and AI diagnosis starts immediately.
        </p>
        <a href="/dashboard" style={{ display: "inline-block", padding: "12px 24px", background: green, color: bg, borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          Go to Dashboard →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 22, fontWeight: 900, color: "#fff", textDecoration: "none" }}>PipelineIQ</a>
          <p style={{ color: muted, fontSize: 14, marginTop: 8 }}>Start your free account — no credit card required</p>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Raja Karuppasamy"
              style={{ width: "100%", padding: "10px 14px", background: "#020c1a", border: `1px solid ${border}`, borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Work email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="raja@company.com"
              style={{ width: "100%", padding: "10px 14px", background: "#020c1a", border: `1px solid ${border}`, borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company (optional)</label>
            <input
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Acme Corp"
              style={{ width: "100%", padding: "10px 14px", background: "#020c1a", border: `1px solid ${border}`, borderRadius: 8, color: "#fff", fontFamily: "monospace", fontSize: 14, boxSizing: "border-box" as const }}
            />
          </div>

          {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "#ff6b6b20", border: "1px solid #ff6b6b40", borderRadius: 8, color: "#ff6b6b", fontSize: 13 }}>{error}</div>}

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? "#334155" : green, color: loading ? "#64748b" : bg, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, fontFamily: "monospace", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Creating account..." : "Get Free API Key →"}
          </button>

          <div style={{ marginTop: 20, padding: 16, background: "#020c1a", borderRadius: 8, fontSize: 12, color: muted }}>
            <div style={{ marginBottom: 6 }}>✅ 100 pipeline runs/month free</div>
            <div style={{ marginBottom: 6 }}>✅ AI diagnosis on every failure</div>
            <div style={{ marginBottom: 6 }}>✅ Slack + email alerts</div>
            <div>✅ DORA metrics dashboard</div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: muted }}>
          Already have an account? <a href="/dashboard" style={{ color: green }}>Go to dashboard</a>
        </p>
      </div>
    </div>
  );
}
