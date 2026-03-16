import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { webhookUrl } = await request.json();

  if (!webhookUrl) {
    return NextResponse.json({ error: "Missing webhook URL" }, { status: 400 });
  }

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
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Slack returned " + res.status }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}