export async function sendSlackAlert(webhookUrl: string, message: SlackMessage) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    console.error("Slack alert failed:", response.status);
    return false;
  }
  return true;
}

export interface SlackMessage {
  text?: string;
  blocks?: any[];
}

export function buildRiskAlertMessage(deploy: {
  repoName: string;
  score: number;
  riskLevel: string;
  commitMessage: string;
  triggeredBy: string;
  branch: string;
  htmlUrl?: string;
}): SlackMessage {
  const emoji = deploy.riskLevel === "danger" ? "🔴" : deploy.riskLevel === "warning" ? "🟡" : "🟢";

  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `${emoji} High Risk Deploy — Score ${deploy.score}/100` },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Repo:*\n${deploy.repoName}` },
          { type: "mrkdwn", text: `*Branch:*\n${deploy.branch}` },
          { type: "mrkdwn", text: `*Author:*\n${deploy.triggeredBy}` },
          { type: "mrkdwn", text: `*Risk Level:*\n${deploy.riskLevel.toUpperCase()}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Commit:*\n${deploy.commitMessage}` },
      },
      ...(deploy.htmlUrl ? [{
        type: "actions",
        elements: [{
          type: "button",
          text: { type: "plain_text", text: "View on GitHub" },
          url: deploy.htmlUrl,
        }],
      }] : []),
    ],
  };
}

export function buildIncidentAlertMessage(incident: {
  repoName: string;
  title: string;
  errorSummary: string;
  triggeredBy: string;
  branch: string;
  commitMessage: string;
}): SlackMessage {
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🚨 Incident — ${incident.repoName}` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${incident.title}*` },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Branch:*\n${incident.branch}` },
          { type: "mrkdwn", text: `*Author:*\n${incident.triggeredBy}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Error:*\n\`\`\`${incident.errorSummary}\`\`\`` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Commit:*\n${incident.commitMessage}` },
      },
    ],
  };
}