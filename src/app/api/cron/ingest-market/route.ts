import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const [
    { authorizeCron },
    { ingestGlobalMarketData },
    { refreshPublicMarketCache },
    { refreshLatestRecommendations }
  ] = await Promise.all([
    import("@/lib/cron"),
    import("@/server/services/pricing/global"),
    import("@/server/services/pricing/public-cache"),
    import("@/server/services/pricing/refresh")
  ]);
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const market = await ingestGlobalMarketData();
  const recommendations = market.ok ? await refreshLatestRecommendations("qatar") : { ok: false, created: 0 };
  const publicCache = market.ok ? await refreshPublicMarketCache("qatar") : { ok: false, updatedKeys: 0, karats: [] };

  return NextResponse.json({ ok: true, market, recommendations, publicCache });
}
