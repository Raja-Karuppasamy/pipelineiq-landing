"use client";
import { useState, useEffect } from "react";

const TERMINAL_LINES = [
  { delay: 0, text: "$ git push origin main", type: "cmd" },
  { delay: 700, text: "✓ CI workflow triggered...", type: "info" },
  { delay: 1400, text: "✓ Build passed — 24s", type: "info" },
  { delay: 2000, text: "⚡ DeployGuard scoring deploy...", type: "label" },
  { delay: 2600, text: "   Lines changed: 342  (+15 pts)", type: "diag" },
  { delay: 2900, text: "   Files touched: 18   (+10 pts)", type: "diag" },
  { delay: 3200, text: "   Tests: all pass      (+0 pts)", type: "diag" },
  { delay: 3500, text: "   Friday 4:47pm        (+20 pts)", type: "error" },
  { delay: 4000, text: "⚠ Risk Score: 67/100 — WARNING", type: "error" },
  { delay: 4500, text: "📣 Slack alert sent to #deploy-alerts", type: "fix" },
  { delay: 5000, text: "💰 Cost: $0.19 (Linux, 24 min)", type: "save" },
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
        <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 12, color: "#475569" }}>deployguard — terminal</span>
      </div>
      <div style={{ background: "#020c1a", padding: "24px", minHeight: 280 }}>
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
  { icon: "🛡️", title: "Deploy Guard", desc: "Every push gets a 0–100 risk score. Lines changed, test results, time of day, author history — scored automatically before it hits production.", tag: "Before Deploy", color: "#10b981" },
  { icon: "💰", title: "Cost Tracker", desc: "See exactly where your GitHub Actions budget goes. Per-repo, per-workflow spend with automatic waste detection for flaky reruns.", tag: "During Runs", color: "#f59e0b" },
  { icon: "🔥", title: "Incident Replay", desc: "When deploys fail, get an auto-generated timeline of what happened — commits, PRs, workflow logs. Export to Markdown for postmortems.", tag: "After Failure", color: "#ef4444" },
  { icon: "📣", title: "Slack Alerts", desc: "Morning digest of overnight deploys. Instant alerts when risk scores spike. Incident notifications with full context.", tag: "Real-time", color: "#3b82f6" },
  { icon: "📊", title: "Team Dashboard", desc: "One view for engineering managers — deploys, risk trends, spend, and incidents across all your repos.", tag: "Visibility", color: "#8b5cf6" },
  { icon: "🔌", title: "2-Minute Setup", desc: "Install the GitHub App, connect your repos, and see your first risk score in under 5 minutes. No config files.", tag: "Easy", color: "#64d8a3" },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", features: ["1 repository", "Basic risk scores", "7-day cost view", "Community support"], cta: "Start Free", highlight: false },
  { name: "Team", price: "$49", period: "/ month", features: ["Up to 10 repos", "Deploy Guard + Slack alerts", "90-day cost tracking + reports", "Incident Replay (last 10)", "Up to 10 team members", "Email support (48hr)"], cta: "Start 14-Day Trial", highlight: true },
  { name: "Growth", price: "$199", period: "/ month", features: ["Unlimited repos", "Custom risk rules", "Unlimited cost history + export", "Unlimited incidents + export", "Unlimited team members", "Priority support (24hr)"], cta: "Start 14-Day Trial", highlight: false },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#020812", color: "#fff", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        button:hover { opacity: 0.9; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 48px", borderBottom: "1px solid #0f172a", position: "sticky", top: 0, background: "rgba(2,8,18,0.95)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 18 }}>
          Deploy<span style={{ color: "#3b82f6" }}>Guard</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" style={{ color: "#64748b", fontSize: 14 }}>Features</a>
          <a href="#pricing" style={{ color: "#64748b", fontSize: 14 }}>Pricing</a>
          <a href="#how" style={{ color: "#64748b", fontSize: 14 }}>How it works</a>
          <a href="/overview" style={{ padding: "8px 18px", background: "transparent", border: "1px solid #1e293b", color: "#fff", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
            Dashboard
          </a>
          <a href="/signup" style={{ padding: "8px 18px", background: "#3b82f6", color: "#fff", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
            Get Started →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid #1e293b", background: "#0f172a", width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>Now in beta — free for early teams</span>
            </div>
            <div>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px" }}>Know what shipped.</h1>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", color: "#3b82f6" }}>Before it breaks.</h1>
            </div>
            <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.7, maxWidth: 440 }}>
              Deployment risk scores, CI/CD cost tracking, and automated incident timelines — one dashboard for engineering leaders.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <a href="/signup" style={{ padding: "14px 28px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontFamily: "monospace", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                Connect GitHub — Free →
              </a>
              <a href="/overview" style={{ padding: "14px 28px", borderRadius: 8, background: "transparent", border: "1px solid #1e293b", color: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" as const }}>
                Dashboard →
              </a>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#334155", fontFamily: "monospace" }}>
              <span>✓ No credit card</span><span>✓ 5-min setup</span><span>✓ GitHub App</span>
            </div>
          </div>
          <Terminal />
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid #0f172a", borderBottom: "1px solid #0f172a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
          {[
            { value: "0–100", label: "risk score per deploy" },
            { value: "$0.008", label: "per-minute cost tracking" },
            { value: "< 5s", label: "Slack alert delivery" },
            { value: "5min", label: "setup time" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "monospace", color: "#3b82f6", marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>Three modules. One dashboard.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, borderRadius: 12, overflow: "hidden", background: "#0f172a" }}>
          {[
            { step: "01", title: "Before: Risk Score", desc: "Every push to production gets a 0–100 risk score based on lines changed, test results, time of day, and author history. High-risk deploys trigger Slack alerts.", icon: "🛡️", color: "#10b981" },
            { step: "02", title: "During: Cost Track", desc: "Every CI/CD run is costed automatically — per-repo, per-workflow, per-OS. Flaky reruns and wasteful builds get flagged so you can save money.", icon: "💰", color: "#f59e0b" },
            { step: "03", title: "After: Incident Replay", desc: "When a deploy fails, an incident timeline is auto-generated with commits, PRs, and error context. Export to Markdown for blameless postmortems.", icon: "🔥", color: "#ef4444" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#020812", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{item.step}</span>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{item.title}</h3>
              <div style={{ width: 40, height: 3, borderRadius: 2, background: item.color }} />
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Features</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>Everything your team needs</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: "28px 24px", borderRadius: 12, border: "1px solid #0f172a", background: "#020812", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>{f.icon}</div>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: f.color, padding: "2px 8px", borderRadius: 4, background: f.color + "15", border: "1px solid " + f.color + "30", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub App Code */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ borderRadius: 12, border: "1px solid #0f172a", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", background: "#0d1829", borderBottom: "1px solid #1e293b" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff6b6b" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#64d8a3" }} />
            <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 11, color: "#475569" }}>Setup — 3 steps, 5 minutes</span>
          </div>
          <div style={{ background: "#020c1a", padding: "28px 32px" }}>
            <pre style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#94a3b8", overflowX: "auto" }}>{`# 1. Install DeployGuard GitHub App
#    → github.com/apps/deployguard

# 2. Select your repos
#    → Done. Webhooks are automatic.

# 3. Open your dashboard
#    → deployguard.dev/overview
#    → Risk scores appear on first push.

# That's it. No config files. No CI changes.`}</pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px" }}>Start free. Scale with your team.</h2>
          <p style={{ color: "#64748b", marginTop: 12, fontSize: 15 }}>No credit card required. 14-day free trial on paid plans.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {PRICING.map((plan, i) => (
            <div key={i} style={{ borderRadius: 12, padding: "36px 32px", border: `1px solid ${plan.highlight ? "#3b82f6" : "#0f172a"}`, background: "#020812", display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", padding: "4px 14px", background: "#3b82f6", color: "#fff", fontSize: 11, fontFamily: "monospace", fontWeight: 700, borderRadius: 999, whiteSpace: "nowrap" }}>
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
                    <span style={{ color: "#3b82f6", fontSize: 11 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{
                width: "100%", padding: "14px", borderRadius: 8, textAlign: "center", display: "block",
                background: plan.highlight ? "#3b82f6" : "#0f172a",
                border: plan.highlight ? "none" : "1px solid #1e293b",
                color: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: 13,
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 96px" }}>
        <div style={{ borderRadius: 16, border: "1px solid #0f172a", background: "#0a1628", padding: "80px 48px", textAlign: "center", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.15 }}>
            Stop flying blind.<br />
            <span style={{ color: "#3b82f6" }}>Start shipping safely.</span>
          </h2>
          <p style={{ color: "#64748b", maxWidth: 440, fontSize: 15, lineHeight: 1.7 }}>Connect your GitHub in 5 minutes. See your first risk score on the next push.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/signup" style={{ padding: "14px 32px", background: "#3b82f6", color: "#fff", borderRadius: 8, fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>
              Get Started Free →
            </a>
            <a href="/overview" style={{ padding: "14px 32px", border: "1px solid #1e293b", color: "#fff", borderRadius: 8, fontFamily: "monospace", fontSize: 14 }}>
              View Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0f172a", padding: "32px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#475569" }}>
              Deploy<span style={{ color: "#3b82f6" }}>Guard</span> © 2026 · A <a href="https://clearfix.co" style={{ color: "#475569" }}>ClearFix.co</a> product
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "GitHub", href: "https://github.com/apps/deployguard" },
              { label: "Twitter", href: "https://x.com/deployguard" },
              { label: "Contact", href: "mailto:raja@deployguard.dev" },
            ].map((l, i) => (
              <a key={i} href={l.href} target="_blank" style={{ fontFamily: "monospace", fontSize: 12, color: "#334155" }}>{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}