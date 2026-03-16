import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { refreshRuntimePublicMarketCache } from "@/server/services/pricing/runtime-public-cache";

export async function GET(request: Request) {
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
