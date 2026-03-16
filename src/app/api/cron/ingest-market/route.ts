import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { ingestGlobalMarketData } from "@/server/services/pricing/global";
import { refreshPublicMarketCache } from "@/server/services/pricing/public-cache";
import { refreshLatestRecommendations } from "@/server/services/pricing/refresh";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const market = await ingestGlobalMarketData();
  const recommendations = market.ok ? await refreshLatestRecommendations("qatar") : { ok: false, created: 0 };
  const publicCache = market.ok ? await refreshPublicMarketCache("qatar") : { ok: false, updatedKeys: 0, karats: [] };

  return NextResponse.json({ ok: true, market, recommendations, publicCache });
}
