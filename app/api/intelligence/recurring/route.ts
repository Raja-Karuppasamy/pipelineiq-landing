import { NextRequest, NextResponse } from "next/server";
import { detectRecurringFailures } from "@/lib/intelligence/recurring";
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
  const minFailures = parseInt(searchParams.get("min") || "2");

  // Get org
  const { data: org } = await getSupabase()
    .from("organizations")
    .select("id")
    .limit(1)
    .single();

  if (!org) {
    return NextResponse.json({ error: "No org found" }, { status: 404 });
  }

  const recurring = await detectRecurringFailures(org.id, days, minFailures);

  return NextResponse.json({
    recurring,
    summary: {
      totalPatterns: recurring.length,
      totalRecurringFailures: recurring.reduce((sum, r) => sum + r.failureCount, 0),
      mostAffectedRepo: recurring[0]?.repoFullName?.split("/").pop() || null,
      timeframeDays: days,
    },
  });
}