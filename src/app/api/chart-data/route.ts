import { NextResponse } from "next/server";

import { getRuntimePricePageData, refreshRuntimePublicMarketCache } from "@/server/services/pricing/runtime-public-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countrySlug = searchParams.get("country") ?? "qatar";
    const karat = searchParams.get("karat") ?? "22K";

    let runtime = await getRuntimePricePageData(countrySlug, karat);
    if (!runtime) {
      const refreshed = await refreshRuntimePublicMarketCache(countrySlug);
      runtime = refreshed?.pricePages[karat] ?? null;
    }

    if (!runtime) {
      return NextResponse.json(
        { ok: false, error: "Live chart data is temporarily unavailable." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      country: runtime.country.slug,
      karat,
      points: runtime.chartData.map((point) => ({
        timestamp: point.timestamp,
        pricePerGram: point.price
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chart data failure.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
