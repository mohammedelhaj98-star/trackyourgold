import "server-only";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";
import { evaluateRecommendation, persistRecommendation } from "@/server/services/pricing/recommendation";

export async function refreshLatestRecommendations(countrySlug = "qatar") {
  const country = await db.country.findUnique({ where: { slug: countrySlug } });
  if (!country) throw new Error("Country not found.");

  const latestGlobal = await db.globalGoldPrice.findFirst({ where: { countryId: country.id }, orderBy: { capturedAt: "desc" } });
  const snapshots = await db.goldPriceSnapshot.findMany({
    where: { countryId: country.id, sourceKind: "STORE" },
    orderBy: { capturedAt: "desc" },
    take: 30
  });

  const karats = [...new Set(snapshots.map((snapshot) => snapshot.karatLabel))];
  let created = 0;

  for (const karatLabel of karats) {
    const series = await db.goldPriceSnapshot.findMany({
      where: { countryId: country.id, karatLabel, sourceKind: "STORE" },
      orderBy: { capturedAt: "asc" },
      take: 180
    });

    const latestSnapshot = series.at(-1);
    if (!latestSnapshot) continue;

    const existing = await db.recommendation.findFirst({
      where: { snapshotId: latestSnapshot.id },
      orderBy: { createdAt: "desc" }
    });

    if (existing) continue;

    const recommendation = await evaluateRecommendation({
      countryId: country.id,
      karatLabel,
      snapshots: series.map((item) => ({ id: item.id, pricePerGram: item.pricePerGram, capturedAt: item.capturedAt })),
      spotEstimateQarPerGram: latestGlobal ? decimalToNumber(latestGlobal.qarPerGramEstimate) : null
    });

    if (!recommendation) continue;
    await persistRecommendation({
      countryId: country.id,
      karatLabel,
      snapshotId: latestSnapshot.id,
      recommendation
    });
    created += 1;
  }

  return { ok: true, created };
}
