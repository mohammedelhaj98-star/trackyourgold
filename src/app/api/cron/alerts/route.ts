import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { evaluateAlertRules } from "@/server/services/alerts/alerts";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await evaluateAlertRules("qatar");
  return NextResponse.json(result);
}
