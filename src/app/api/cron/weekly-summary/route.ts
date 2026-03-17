import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const [{ authorizeCron }, { bootstrapWeeklySummaryRules, sendWeeklySummaryEmails }] = await Promise.all([
    import("@/lib/cron"),
    import("@/server/services/alerts/alerts")
  ]);
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await bootstrapWeeklySummaryRules();
  const result = await sendWeeklySummaryEmails("qatar");
  return NextResponse.json(result);
}
