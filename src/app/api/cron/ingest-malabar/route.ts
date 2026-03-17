import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const [
    { authorizeCron },
    { ingestMalabarRates },
    { refreshPublicMarketCache },
    { refreshLatestRecommendations }
  ] = await Promise.all([
    import("@/lib/cron"),
    import("@/server/services/pricing/malabar"),
    import("@/server/services/pricing/public-cache"),
    import("@/server/services/pricing/refresh")
  ]);
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const scraper = await ingestMalabarRates();
  const recommendations = scraper.ok ? await refreshLatestRecommendations("qatar") : { ok: false, created: 0 };
  const publicCache = scraper.ok ? await refreshPublicMarketCache("qatar") : { ok: false, updatedKeys: 0, karats: [] };

  return NextResponse.json({ ok: true, scraper, recommendations, publicCache });
}
