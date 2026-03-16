import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";
import { getRuntimePricePageData } from "@/server/services/pricing/runtime-public-cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countrySlug = searchParams.get("country") ?? "qatar";
  const karat = searchParams.get("karat") ?? "22K";

  const runtime = await getRuntimePricePageData(countrySlug, karat);
  if (runtime) {
    return NextResponse.json({
      ok: true,
      country: runtime.country.slug,
      karat,
      points: runtime.chartData.map((point) => ({
        timestamp: point.timestamp,
        pricePerGram: point.price
      }))
    });
  }

  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  if (!country) {
    return NextResponse.json({ ok: false, error: "Country not found." }, { status: 404 });
  }

  const series = await db.goldPriceSnapshot.findMany({
    where: { countryId: country.id, karatLabel: karat },
    orderBy: { capturedAt: "asc" },
    take: 240
  });

  return NextResponse.json({
    ok: true,
    country: country.slug,
    karat,
    points: series.map((point) => ({
      timestamp: point.capturedAt.toISOString(),
      pricePerGram: decimalToNumber(point.pricePerGram)
    }))
  });
}
