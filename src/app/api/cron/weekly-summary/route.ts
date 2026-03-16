import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { bootstrapWeeklySummaryRules, sendWeeklySummaryEmails } from "@/server/services/alerts/alerts";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await bootstrapWeeklySummaryRules();
  const result = await sendWeeklySummaryEmails("qatar");
  return NextResponse.json(result);
}
