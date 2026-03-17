import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const [{ authorizeCron }, { refreshRuntimePublicMarketCache }] = await Promise.all([
    import("@/lib/cron"),
    import("@/server/services/pricing/runtime-public-cache")
  ]);
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cache = await refreshRuntimePublicMarketCache("qatar");
    return NextResponse.json({
      ok: true,
      refreshedAt: cache?.refreshedAt ?? null,
      karats: cache ? Object.keys(cache.pricePages) : []
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown runtime public market refresh failure.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
