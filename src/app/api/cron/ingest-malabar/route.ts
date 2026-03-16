import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { ingestMalabarRates } from "@/server/services/pricing/malabar";
import { refreshLatestRecommendations } from "@/server/services/pricing/refresh";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const scraper = await ingestMalabarRates();
  const recommendations = scraper.ok ? await refreshLatestRecommendations("qatar") : { ok: false, created: 0 };

  return NextResponse.json({ ok: true, scraper, recommendations });
}
