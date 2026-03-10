import React from "react";

export default function OverviewPage() {
  const steps = [
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
  ];

  return React.createElement("div", null,
    React.createElement("div", { className: "mb-8" },
      React.createElement("h1", { className: "text-2xl font-bold text-white mb-1" }, "Dashboard"),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Your CI/CD intelligence at a glance"),
    ),

    React.createElement("div", { className: "grid grid-cols-3 gap-4 mb-8" },
      ...[
        { label: "Deploys Today", sub: "Connect repos to start" },
        { label: "Avg Risk Score", sub: "Across all repos" },
        { label: "CI/CD Spend", sub: "This month" },
      ].map((card) =>
        React.createElement("div", {
          key: card.label,
          style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "20px" },
        },
          React.createElement("p", { className: "text-xs uppercase tracking-wider text-gray-500 font-mono mb-3" }, card.label),
          React.createElement("p", { className: "text-3xl font-bold text-white font-mono" }, "\u2014"),
          React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, card.sub),
        )
      ),
    ),

    React.createElement("div", {
      style: { borderRadius: "12px", border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)", padding: "24px" },
    },
      React.createElement("h2", { className: "text-lg font-bold text-white mb-4" }, "Get started"),
      React.createElement("div", { className: "space-y-3" },
        ...steps.map((item) =>
          React.createElement("a", {
            key: item.step,
            href: item.href,
            className: "flex items-center gap-4 p-3 rounded-lg transition-colors group",
            style: { cursor: "pointer", textDecoration: "none" },
            onMouseOver: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; },
            onMouseOut: (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = "transparent"; },
          },
            React.createElement("div", {
              style: { width: "32px", height: "32px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 },
              className: "font-mono text-gray-400",
            }, item.step),
            React.createElement("div", { className: "flex-1" },
              React.createElement("p", { className: "text-sm font-semibold text-white" }, item.title),
              React.createElement("p", { className: "text-xs text-gray-500" }, item.desc),
            ),
            React.createElement("span", { className: "text-gray-600 transition-colors" }, "\u2192"),
          )
        ),
      ),
    ),
  );
}