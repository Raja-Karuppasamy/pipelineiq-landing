import * as jwt from "jsonwebtoken";

async function getInstallationToken(installationId: number): Promise<string> {
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const appId = process.env.GITHUB_APP_ID!;

  // Create JWT
  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { iat: now - 60, exp: now + 600, iss: appId },
    privateKey,
    { algorithm: "RS256" }
  );

  // Exchange JWT for installation token
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const data = await res.json();
  return data.token;
}

export async function postPRComment(
  installationId: number,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<boolean> {
  try {
    const token = await getInstallationToken(installationId);

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ body }),
      }
    );

    return res.ok;
  } catch (err) {
    console.error("Failed to post PR comment:", err);
    return false;
  }
}

export function buildFailureComment(data: {
  repoName: string;
  workflowName: string;
  score: number;
  riskLevel: string;
  commitSha: string;
  branch: string;
  triggeredBy: string;
  errorSummary?: string;
  costUsd?: number;
  duration?: number;
}): string {
  const emoji = data.riskLevel === "danger" ? "🔴" : data.riskLevel === "warning" ? "🟡" : "🟢";
  const statusEmoji = data.score > 70 ? "🚨" : data.score > 40 ? "⚠️" : "✅";

  let comment = `## ${statusEmoji} DeployGuard Analysis\n\n`;
  comment += `| Metric | Value |\n|--------|-------|\n`;
  comment += `| **Risk Score** | ${emoji} ${data.score}/100 (${data.riskLevel}) |\n`;
  comment += `| **Workflow** | ${data.workflowName} |\n`;
  comment += `| **Branch** | ${data.branch} |\n`;
  comment += `| **Author** | @${data.triggeredBy} |\n`;
  comment += `| **Commit** | \`${data.commitSha.substring(0, 7)}\` |\n`;

  if (data.duration) {
    comment += `| **Duration** | ${data.duration}s |\n`;
  }
  if (data.costUsd !== undefined) {
    comment += `| **CI Cost** | $${data.costUsd.toFixed(4)} |\n`;
  }

  if (data.errorSummary) {
    comment += `\n### Failure Details\n`;
    comment += `\`\`\`\n${data.errorSummary}\n\`\`\`\n`;
  }

  comment += `\n---\n`;
  comment += `*Powered by [DeployGuard](https://deployguard.dev) — CI/CD intelligence for engineering teams*`;

  return comment;
}

export function buildRecurringFailureComment(data: {
  workflowName: string;
  failureCount: number;
  timeframeDays: number;
  commonError?: string;
  suggestedFix?: string;
}): string {
  let comment = `## 🔁 DeployGuard — Recurring Failure Detected\n\n`;
  comment += `**Workflow:** ${data.workflowName}\n`;
  comment += `**Occurrences:** ${data.failureCount} failures in last ${data.timeframeDays} days\n\n`;

  if (data.commonError) {
    comment += `### Common Error\n`;
    comment += `\`\`\`\n${data.commonError}\n\`\`\`\n\n`;
  }

  if (data.suggestedFix) {
    comment += `### Suggested Fix\n`;
    comment += `${data.suggestedFix}\n\n`;
  }

  comment += `---\n`;
  comment += `*Powered by [DeployGuard](https://deployguard.dev)*`;

  return comment;
}