import { NextRequest, NextResponse } from "next/server";
import { detectFlakyPipelines } from "@/lib/intelligence/flaky";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");

  const { data: org } = await getSupabase()
    .from("organizations")
    .select("id")
    .limit(1)
    .single();

  if (!org) {
    return NextResponse.json({ error: "No org found" }, { status: 404 });
  }

  const flaky = await detectFlakyPipelines(org.id, days);

  return NextResponse.json({
    flaky,
    summary: {
      totalFlaky: flaky.length,
      worstFlakiness: flaky[0]?.flakiness || 0,
      mostFlakyRepo: flaky[0]?.repoFullName?.split("/").pop() || null,
      timeframeDays: days,
    },
  });
}