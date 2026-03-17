import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const [{ authorizeCron }, { evaluateAlertRules }] = await Promise.all([
    import("@/lib/cron"),
    import("@/server/services/alerts/alerts")
  ]);
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await evaluateAlertRules("qatar");
  return NextResponse.json(result);
}
