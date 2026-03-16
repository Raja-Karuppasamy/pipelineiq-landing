"use client";

import React, { useEffect, useState } from "react";

export default function AlertsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [riskThreshold, setRiskThreshold] = useState(80);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      const config = data.configs?.[0];
      if (config) {
        setWebhookUrl(config.webhook_url || "");
        setRiskThreshold(config.risk_threshold || 80);
        setDailyDigest(config.daily_digest !== false);
        setIncidentAlerts(config.incident_alerts !== false);
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    // Get org_id from first org (simplification for solo founder)
    const orgRes = await fetch("/api/deploy-guard?limit=1");
    const orgData = await orgRes.json();
    const orgId = orgData.deploys?.[0]?.org_id;

    if (!orgId) {
      setSaving(false);
      return;
    }

    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        channel: "slack",
        webhookUrl,
        riskThreshold,
        dailyDigest,
        incidentAlerts,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTest() {
    if (!webhookUrl) {
      setTestResult("Enter a webhook URL first");
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: "🧪 PipelineIQ Pro — Test Alert" },
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: "If you see this, Slack alerts are working! 🎉\n\nYou'll receive alerts for high-risk deploys and failed workflows." },
            },
          ],
        }),
      });

      if (res.ok) {
        setTestResult("success");
      } else {
        setTestResult("Failed — check your webhook URL");
      }
    } catch {
      setTestResult("Failed — check your webhook URL");
    }
    setTesting(false);
  }

  if (loading) {
    return React.createElement("div", { style: { textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.3)" } }, "Loading...");
  }

  return React.createElement("div", { style: { maxWidth: "640px" } },
    // Header
    React.createElement("div", { style: { marginBottom: "32px" } },
      React.createElement("h1", { className: "text-2xl font-bold text-white", style: { marginBottom: "4px" } }, "Alerts"),
      React.createElement("p", { className: "text-gray-500 text-sm" }, "Get notified when deploys are risky or workflows fail"),
    ),

    // Slack webhook
    React.createElement("div", {
      style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "24px", marginBottom: "16px" },
    },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" } },
        React.createElement("span", { style: { fontSize: "18px" } }, "💬"),
        React.createElement("h2", { style: { fontSize: "16px", fontWeight: 600, color: "white" } }, "Slack Integration"),
      ),

      React.createElement("div", { style: { marginBottom: "16px" } },
        React.createElement("label", { style: { display: "block", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" } }, "Webhook URL"),
        React.createElement("input", {
          type: "text",
          value: webhookUrl,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value),
          placeholder: "https://hooks.slack.com/services/...",
          style: {
            width: "100%", padding: "10px 12px", borderRadius: "8px", fontSize: "13px",
            background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontFamily: "monospace", outline: "none",
          },
        }),
        React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" } },
          "Create one at api.slack.com/apps → Incoming Webhooks"
        ),
      ),

      React.createElement("button", {
        onClick: handleTest,
        disabled: testing,
        style: {
          padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.7)", cursor: testing ? "wait" : "pointer",
        },
      }, testing ? "Sending..." : "Send Test Alert"),

      testResult ? React.createElement("span", {
        style: {
          marginLeft: "12px", fontSize: "12px",
          color: testResult === "success" ? "#10b981" : "#ef4444",
        },
      }, testResult === "success" ? "✓ Sent! Check Slack" : testResult) : null,
    ),

    // Alert settings
    React.createElement("div", {
      style: { borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "24px", marginBottom: "16px" },
    },
      React.createElement("h2", { style: { fontSize: "16px", fontWeight: 600, color: "white", marginBottom: "20px" } }, "Alert Settings"),

      // Risk threshold
      React.createElement("div", { style: { marginBottom: "20px" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" } },
          React.createElement("label", { style: { fontSize: "13px", color: "rgba(255,255,255,0.6)" } }, "Risk score alert threshold"),
          React.createElement("span", { style: { fontSize: "13px", color: "#f59e0b", fontFamily: "monospace", fontWeight: 700 } }, riskThreshold),
        ),
        React.createElement("input", {
          type: "range",
          min: 40,
          max: 100,
          step: 5,
          value: riskThreshold,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setRiskThreshold(parseInt(e.target.value)),
          style: { width: "100%", accentColor: "#3b82f6" },
        }),
        React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "4px" } },
          "Alert when a deploy's risk score exceeds this value"
        ),
      ),

      // Toggles
      ...[
        { label: "Incident alerts", desc: "Get alerted when a deploy fails", value: incidentAlerts, setter: setIncidentAlerts },
        { label: "Daily digest", desc: "Morning summary of overnight deploys", value: dailyDigest, setter: setDailyDigest },
      ].map((toggle) =>
        React.createElement("div", {
          key: toggle.label,
          style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.04)" },
        },
          React.createElement("div", null,
            React.createElement("p", { style: { fontSize: "13px", color: "rgba(255,255,255,0.6)" } }, toggle.label),
            React.createElement("p", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)" } }, toggle.desc),
          ),
          React.createElement("button", {
            onClick: () => toggle.setter(!toggle.value),
            style: {
              width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
              background: toggle.value ? "#3b82f6" : "rgba(255,255,255,0.1)",
              position: "relative" as const, transition: "background 0.2s",
            },
          },
            React.createElement("div", {
              style: {
                width: "18px", height: "18px", borderRadius: "50%", background: "white",
                position: "absolute" as const, top: "3px",
                left: toggle.value ? "23px" : "3px",
                transition: "left 0.2s",
              },
            }),
          ),
        ),
      ),
    ),

    // Save button
    React.createElement("button", {
      onClick: handleSave,
      disabled: saving,
      style: {
        padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
        background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none",
        color: "white", cursor: saving ? "wait" : "pointer", width: "100%",
        boxShadow: "0 4px 20px rgba(59,130,246,0.2)",
      },
    }, saving ? "Saving..." : saved ? "✓ Saved!" : "Save Alert Settings"),
  );
}