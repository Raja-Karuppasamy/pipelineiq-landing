export default function OverviewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Your CI/CD intelligence at a glance
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-mono mb-3">
            Deploys Today
          </p>
          <p className="text-3xl font-bold text-white font-mono">—</p>
          <p className="text-xs text-gray-600 mt-1">Connect repos to start</p>
        </div>
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-mono mb-3">
            Avg Risk Score
          </p>
          <p className="text-3xl font-bold text-white font-mono">—</p>
          <p className="text-xs text-gray-600 mt-1">Across all repos</p>
        </div>
        <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-mono mb-3">
            CI/CD Spend
          </p>
          <p className="text-3xl font-bold text-white font-mono">—</p>
          <p className="text-xs text-gray-600 mt-1">This month</p>
        </div>
      </div>

      <div style={{ borderRadius: "12px", border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)", padding: "24px" }}>
        <h2 className="text-lg font-bold text-white mb-4">Get started</h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Connect your GitHub repos",
              desc: "Install the PipelineIQ GitHub App to start ingesting workflow data",
              href: "/repos",
            },
            {
              step: "2",
              title: "See your first risk scores",
              desc: "Deploy Guard will score every push to production automatically",
              href: "/deploy-guard",
            },
            {
              step: "3",
              title: "Set up Slack alerts",
              desc: "Get a morning digest of the riskiest deploys from overnight",
              href: "/alerts",
            },
          ].map((item) => (
            
              key={item.step}
              href={item.href}
              className="flex items-center gap-4 p-3 rounded-lg transition-colors group"
              style={{ cursor: "pointer" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }} className="font-mono text-gray-400">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}