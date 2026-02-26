"use client";
import { useState, useEffect } from "react";

const TERMINAL_LINES = [
  { delay: 0, text: "$ pipelineiq analyze --repo acme/backend", type: "cmd" },
  { delay: 900, text: "✓ Fetching pipeline data...", type: "info" },
  { delay: 1600, text: "✓ Analyzing 47 workflow runs...", type: "info" },
  { delay: 2300, text: "⚠ CRITICAL: Deploy Production failed", type: "error" },
  { delay: 3000, text: "🧠 AI Diagnosis:", type: "label" },
  { delay: 3200, text: "   Cannot connect to db.production:5432.", type: "diag" },
  { delay: 3500, text: "   Security group blocking port 5432.", type: "diag" },
  { delay: 4000, text: "✅ Fix: Open port 5432 in AWS SG sg-0a1b2c3d", type: "fix" },
  { delay: 4500, text: "⏱  Est. time saved: 47 minutes", type: "save" },
];

function Terminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay + 800);
    });
  }, []);

  const colors: Record<string, string> = {
    cmd: "#e2e8f0", info: "#64d8a3", error: "#ff6b6b",
    label: "#fbbf24", diag: "#94a3b8", fix: "#64d8a3", save: "#a78bfa",
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#0d1829", borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff6b6b" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#64d8a3" }} />
        <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 12, color: "#475569" }}>pipelineiq — terminal</span>
      </div>
      <div style={{ background: "#020c1a", padding: "24px", minHeight: 260 }}>
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ fontFamily: "monospace", fontSize: 13, lineHeight: "2", color: colors[line.type] || "#fff" }}>
            {line.text}
          </div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span style={{ display: "inline-block", width: 8, height: 16, background: "#64d8a3", verticalAlign: "middle" }} />
        )}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "⚡", title: "Instant Detection", desc: "Know the moment a pipeline fails — before your team even opens Slack." },
  { icon: "🧠", title: "AI Root Cause Analysis", desc: "Claude reads error logs and returns exact fixes. Specific steps, not generic advice." },
  { icon: "📊", title: "Pipeline Analytics", desc: "Success rates, avg durations, failure trends across all your repositories." },
  { icon: "🔔", title: "Slack Alerts", desc: "Rich alerts with repo, branch, commit, diagnosis and fix. Zero context-switching." },
  { icon: "🌍", title: "Environment Drift", desc: "Catch config mismatches between dev, staging, and production before outages." },
  { icon: "🔌", title: "2-Min Integration", desc: "One GitHub Actions step. One API key. Works with any CI/CD workflow." },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", features: ["2 repositories", "50 runs/month", "Basic insights", "Email alerts"], cta: "Start Free", highlight: false },
  { name: "Starter", price: "$49", period: "/ month", features: ["10 repositories", "Unlimited runs", "AI diagnosis", "Slack alerts", "Drift detection"], cta: "Start Free Trial", highlight: true },
  { name: "Team", price: "$199", period: "/ month", features: ["Unlimited repos", "AI diagnosis", "Slack + webhooks", "Drift detection", "Priority support"], cta: "Start Free Trial", highlight: false },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#020812", color: "#fff", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        ::placeholder { color: #334155; }
        button:hover { opacity: 0.9; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", borderBottom: "1px solid #0f172a", position: "sticky", top: 0, background: "rgba(2,8,18,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18 }}>PipelineIQ</span>
        
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" style={{ color: "#64748b", fontSize: 14 }}>Features</a>
          <a href="#pricing" style={{ color: "#64748b", fontSize: 14 }}>Pricing</a>
          <a href="https://pipelineiq-production-3496.up.railway.app/docs" target="_blank" style={{ color: "#64748b", fontSize: 14 }}>Docs</a>
          <a href="https://pipelineiq-production-3496.up.railway.app/docs" target="_blank"
            style={{ padding: "8px 18px", background: "#64d8a3", color: "#020812", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
            API Docs →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid #1e293b", background: "#0f172a", width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#64d8a3", display: "inline-block" }} />
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64d8a3" }}>Now in beta — free for early teams</span>
            </div>
            <div>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px" }}>Your pipelines</h1>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", color: "#64d8a3" }}>fail smarter</h1>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", color: "#1e293b" }}>with PipelineIQ</h1>
            </div>
            <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.7, maxWidth: 420 }}>
              AI-powered DevOps intelligence. When a pipeline fails, your team gets the diagnosis and fix in Slack — within seconds.
            </p>
            {!submitted ? (
              <form onSubmit={async e => { e.preventDefault(); if (!email) return; await fetch("https://formspree.io/f/xlgwzwnr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setSubmitted(true); }} style={{ display: "flex", gap: 12, maxWidth: 420 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                  style={{ flex: 1, padding: "12px 16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 14, color: "#fff", outline: "none" }} />
                <button type="submit" style={{ padding: "12px 20px", background: "#64d8a3", color: "#020812", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Get Early Access
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#0f172a", border: "1px solid rgba(100,216,163,0.3)", borderRadius: 8, maxWidth: 420 }}>
                <span style={{ color: "#64d8a3" }}>✓</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "#64d8a3" }}>You are on the list. We will be in touch soon.</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#334155", fontFamily: "monospace" }}>
              <span>✓ No credit card</span><span>✓ 2-min setup</span><span>✓ GitHub Actions</span>
            </div>
          </div>
          <Terminal />
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid #0f172a", borderBottom: "1px solid #0f172a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[{ value: "47min", label: "avg time saved per incident" }, { value: "92%", label: "diagnosis accuracy" }, { value: "< 5s", label: "alert delivery" }, { value: "2min", label: "integration time" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "monospace", color: "#64d8a3", marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64d8a3", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>From failure to fix in seconds</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, borderRadius: 12, overflow: "hidden", background: "#0f172a" }}>
          {[
            { step: "01", title: "Pipeline fails", desc: "A workflow completes on GitHub. One step sends the result and logs to PipelineIQ.", icon: "💥" },
            { step: "02", title: "AI analyzes", desc: "Claude reads the error logs, identifies the root cause, and generates a specific fix.", icon: "🧠" },
            { step: "03", title: "Team gets the fix", desc: "A Slack alert arrives with diagnosis and steps. Engineer resolves in minutes, not hours.", icon: "✅" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#020812", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{item.step}</span>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64d8a3", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Features</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>Everything your team needs</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: "28px 24px", borderRadius: 12, border: "1px solid #0f172a", background: "#020812", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 24 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ borderRadius: 12, border: "1px solid #0f172a", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: "#0d1829", borderBottom: "1px solid #1e293b" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff6b6b" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#64d8a3" }} />
            <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 11, color: "#475569" }}>.github/workflows/deploy.yml</span>
          </div>
          <div style={{ background: "#020c1a", padding: "28px 32px" }}>
            <pre style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#94a3b8", overflowX: "auto" }}>{`# Add one step to any GitHub Actions workflow
- name: Notify PipelineIQ
  if: always()
  run: |
    curl -X POST $PIPELINEIQ_URL/api/v1/pipelines/runs \\
      -H "X-PipelineIQ-Key: $PIPELINEIQ_API_KEY" \\
      -H "Content-Type: application/json" \\
      -d '{"repo":"acme/backend","status":"failure","branch":"main"}'`}</pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64d8a3", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>Simple, transparent pricing</h2>
          <p style={{ color: "#64748b", marginTop: 12, fontSize: 15 }}>Start free. Upgrade when ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PRICING.map((plan, i) => (
            <div key={i} style={{ borderRadius: 12, padding: "36px 32px", border: `1px solid ${plan.highlight ? "#64d8a3" : "#0f172a"}`, background: "#020812", display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "4px 14px", background: "#64d8a3", color: "#020812", fontSize: 11, fontFamily: "monospace", fontWeight: 700, borderRadius: 999, whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#475569", marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-2px" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: "#475569", fontFamily: "monospace" }}>{plan.period}</span>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                    <span style={{ color: "#64d8a3", fontSize: 11 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button style={{ width: "100%", padding: "14px", borderRadius: 8, border: plan.highlight ? "none" : "1px solid #1e293b", background: plan.highlight ? "#64d8a3" : "#0f172a", color: plan.highlight ? "#020812" : "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ borderRadius: 16, border: "1px solid #0f172a", background: "#0a1628", padding: "80px 48px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.15 }}>
            Stop debugging pipelines.<br />
            <span style={{ color: "#64d8a3" }}>Start shipping.</span>
          </h2>
          <p style={{ color: "#64748b", maxWidth: 400, fontSize: 15, lineHeight: 1.7 }}>Join engineering teams saving hours every week on pipeline failures.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://pipelineiq-production-3496.up.railway.app/docs" target="_blank"
              style={{ padding: "14px 32px", background: "#64d8a3", color: "#020812", borderRadius: 8, fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>
              Read the Docs →
            </a>
            <a href="mailto:raja@pipelineiq.dev"
              style={{ padding: "14px 32px", border: "1px solid #1e293b", color: "#fff", borderRadius: 8, fontFamily: "monospace", fontSize: 14 }}>
              Talk to founder
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0f172a", padding: "32px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#475569" }}>PipelineIQ © 2026</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "API Docs", href: "https://pipelineiq-production-3496.up.railway.app/docs" }, { label: "Contact", href: "mailto:raja@pipelineiq.dev" }, { label: "GitHub", href: "https://github.com/Raja-Karuppasamy/pipelineiq" }].map((l, i) => (
              <a key={i} href={l.href} target="_blank" style={{ fontFamily: "monospace", fontSize: 12, color: "#334155" }}>{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}