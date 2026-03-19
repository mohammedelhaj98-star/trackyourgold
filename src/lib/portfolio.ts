import { apiFetch, readJson } from "./api";

export const RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "6M", days: 180 },
  { label: "All", days: 365 }
] as const;

export type RangeDays = (typeof RANGE_OPTIONS)[number]["days"];

export type LatestRatesPayload = {
  asOf: string;
  currency: string;
  unit: string;
  pricesByKarat: Record<string, number>;
  source: {
    code: string;
    name: string;
  };
  stale: boolean;
};

export type PublicHomePayload = {
  latestPrice22k: number;
  latestPrice24k: number;
  marketAsOf: string;
  marketStale: boolean;
  retail: { latestPrice22k: number; latestPrice24k: number; asOf: string; stale: boolean } | null;
};

export type QuoteHistoryPoint = {
  asOf: string;
  price22k: number;
  price24k: number;
};

export type ApiVault = {
  id: string;
  name: string;
  defaultCurrency: string;
};

export type ApiVaultItem = {
  id: string;
  vaultId?: string;
  itemName: string;
  category: string;
  purityKarat: number;
  grossWeightG: number;
  stoneWeightG: number;
  netGoldWeightG: number;
  purchaseDate: string;
  purchaseTotalPriceQar: number;
  makingChargesQar: number;
  vatQar: number;
  purchaseStoreName: string | null;
  purchaseLocation: string | null;
  purchaseNotes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type HoldingMeta = {
  tags: string[];
  purchaseBasis: "known" | "none";
  purchasePriceMode: "total" | "per_gram";
  purchaseDateProvided: boolean;
};

export type ParsedHoldingNotes = HoldingMeta & {
  notes: string;
};

export type PortfolioHolding = {
  id: string;
  name: string;
  vaultId: string;
  vaultName: string;
  karat: number;
  grams: number;
  fineGoldGrams: number;
  worthNowQar: number;
  gainLossQar: number | null;
  gainLossPct: number | null;
  breakEvenPerGramQar: number | null;
  purchaseDate: string | null;
  purchaseTotalQar: number | null;
  tags: string[];
  notes: string;
  purchaseBasisKnown: boolean;
  purchasePriceMode: "total" | "per_gram";
  category: string;
  store: string | null;
  location: string | null;
  rawItem: ApiVaultItem;
};

export type PortfolioSummary = {
  portfolioValueQar: number;
  fineGoldGrams: number;
  investedQar: number;
  profitLossQar: number | null;
  profitLossPct: number | null;
  live22kQar: number;
  lastUpdated: string;
  holdingsCount: number;
};

export type TierProgress = {
  currentTier: "starter" | "builder" | "keeper" | "treasury" | "legacy";
  nextTier: "starter" | "builder" | "keeper" | "treasury" | "legacy" | null;
  gramsToNextTier: number;
  tierProgressPct: number;
};

export type Achievement = {
  key:
    | "first-piece"
    | "10g-pure"
    | "50g-pure"
    | "100g-pure"
    | "well-documented"
    | "collector-mix"
    | "tagged-vault"
    | "quarter-kilo";
  unlocked: boolean;
};

export type ChartPoint = {
  asOf: string;
  totalValueQar: number;
};

type HoldingNoteEnvelope = {
  tags?: string[];
  purchaseBasis?: "known" | "none";
  purchasePriceMode?: "total" | "per_gram";
  purchaseDateProvided?: boolean;
};

const META_PREFIX = "__TYG_META__";
const TAG_SUGGESTIONS = ["Jewelry", "Coin", "Bar", "Gift", "Wedding", "Investment"] as const;
const TIER_STEPS = [
  { name: "starter", min: 0, max: 24.99 },
  { name: "builder", min: 25, max: 74.99 },
  { name: "keeper", min: 75, max: 199.99 },
  { name: "treasury", min: 200, max: 499.99 },
  { name: "legacy", min: 500, max: Number.POSITIVE_INFINITY }
] as const;

export function getSuggestedTags() {
  return [...TAG_SUGGESTIONS];
}

export function coerceRangeDays(value: string | string[] | undefined): RangeDays {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  const supported = new Set<RangeDays>(RANGE_OPTIONS.map((option) => option.days));
  return supported.has(parsed as RangeDays) ? (parsed as RangeDays) : 30;
}

export function computeFineGoldGrams(grams: number, karat: number) {
  return Number((grams * (karat / 24)).toFixed(4));
}

export function derivePriceFrom24k(price24k: number, karat: number) {
  return Number((price24k * (karat / 24)).toFixed(4));
}

export function getPriceForKarat(pricesByKarat: Record<string, number>, karat: number) {
  const direct = pricesByKarat[`${karat}K`];
  if (typeof direct === "number") {
    return direct;
  }

  const base24k = pricesByKarat["24K"];
  return typeof base24k === "number" ? derivePriceFrom24k(base24k, karat) : 0;
}

export function parseTags(raw: string | null | undefined) {
  if (!raw) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 8)
    )
  ];
}

export function inferCategory(tags: string[]) {
  if (tags.some((tag) => tag.toLowerCase() === "coin")) {
    return "COIN";
  }

  if (tags.some((tag) => tag.toLowerCase() === "bar")) {
    return "BAR";
  }

  return "JEWELRY";
}

export function inferHoldingName(name: string | undefined, grams: number, karat: number, tags: string[]) {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }

  const leadTag = tags[0];
  if (leadTag) {
    return `${leadTag} ${karat}K`;
  }

  return `${karat}K Gold - ${grams}g`;
}

export function parseHoldingNotes(raw: string | null | undefined): ParsedHoldingNotes {
  const fallback: ParsedHoldingNotes = {
    tags: [],
    purchaseBasis: "known",
    purchasePriceMode: "total",
    purchaseDateProvided: true,
    notes: raw ?? ""
  };

  if (!raw?.startsWith(META_PREFIX)) {
    return fallback;
  }

  const newlineIndex = raw.indexOf("\n");
  const jsonChunk = newlineIndex === -1 ? raw.slice(META_PREFIX.length) : raw.slice(META_PREFIX.length, newlineIndex);
  const noteChunk = newlineIndex === -1 ? "" : raw.slice(newlineIndex + 1);

  try {
    const parsed = JSON.parse(jsonChunk) as HoldingNoteEnvelope;
    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((value) => typeof value === "string") : [],
      purchaseBasis: parsed.purchaseBasis === "none" ? "none" : "known",
      purchasePriceMode: parsed.purchasePriceMode === "per_gram" ? "per_gram" : "total",
      purchaseDateProvided: parsed.purchaseDateProvided ?? true,
      notes: noteChunk
    };
  } catch {
    return fallback;
  }
}

export function serializeHoldingNotes(input: {
  tags: string[];
  purchaseBasis: "known" | "none";
  purchasePriceMode: "total" | "per_gram";
  purchaseDateProvided: boolean;
  notes: string;
}) {
  const payload: HoldingNoteEnvelope = {
    tags: input.tags,
    purchaseBasis: input.purchaseBasis,
    purchasePriceMode: input.purchasePriceMode,
    purchaseDateProvided: input.purchaseDateProvided
  };

  const noteBody = input.notes.trim();
  return `${META_PREFIX}${JSON.stringify(payload)}${noteBody ? `\n${noteBody}` : ""}`;
}

export function normalizeHolding(item: ApiVaultItem, vault: ApiVault, marketRates: LatestRatesPayload): PortfolioHolding {
  const parsedNotes = parseHoldingNotes(item.purchaseNotes);
  const grams = Number(item.netGoldWeightG || Math.max(item.grossWeightG - item.stoneWeightG, 0));
  const fineGoldGrams = computeFineGoldGrams(grams, item.purityKarat);
  const worthNowQar = Number((grams * getPriceForKarat(marketRates.pricesByKarat, item.purityKarat)).toFixed(2));
  const purchaseBasisKnown = parsedNotes.purchaseBasis !== "none";
  const purchaseTotalQar = purchaseBasisKnown ? Number(item.purchaseTotalPriceQar) : null;
  const gainLossQar =
    purchaseBasisKnown && purchaseTotalQar !== null ? Number((worthNowQar - purchaseTotalQar).toFixed(2)) : null;
  const gainLossPct =
    purchaseBasisKnown && purchaseTotalQar
      ? Number((((worthNowQar - purchaseTotalQar) / purchaseTotalQar) * 100).toFixed(2))
      : null;
  const breakEvenPerGramQar =
    purchaseBasisKnown && purchaseTotalQar !== null && grams > 0 ? Number((purchaseTotalQar / grams).toFixed(2)) : null;

  return {
    id: item.id,
    name: item.itemName,
    vaultId: vault.id,
    vaultName: vault.name,
    karat: item.purityKarat,
    grams,
    fineGoldGrams,
    worthNowQar,
    gainLossQar,
    gainLossPct,
    breakEvenPerGramQar,
    purchaseDate: parsedNotes.purchaseDateProvided ? item.purchaseDate : null,
    purchaseTotalQar,
    tags: parsedNotes.tags,
    notes: parsedNotes.notes,
    purchaseBasisKnown,
    purchasePriceMode: parsedNotes.purchasePriceMode,
    category: item.category,
    store: item.purchaseStoreName,
    location: item.purchaseLocation,
    rawItem: item
  };
}

export function summarizePortfolio(holdings: PortfolioHolding[], marketRates: LatestRatesPayload): PortfolioSummary {
  const portfolioValueQar = holdings.reduce((sum, holding) => sum + holding.worthNowQar, 0);
  const fineGoldGrams = holdings.reduce((sum, holding) => sum + holding.fineGoldGrams, 0);
  const investedQar = holdings.reduce((sum, holding) => sum + (holding.purchaseTotalQar ?? 0), 0);
  const profitLossQar = investedQar > 0 ? Number((portfolioValueQar - investedQar).toFixed(2)) : null;
  const profitLossPct =
    investedQar > 0 && profitLossQar !== null ? Number(((profitLossQar / investedQar) * 100).toFixed(2)) : null;

  return {
    portfolioValueQar: Number(portfolioValueQar.toFixed(2)),
    fineGoldGrams: Number(fineGoldGrams.toFixed(4)),
    investedQar: Number(investedQar.toFixed(2)),
    profitLossQar,
    profitLossPct,
    live22kQar: getPriceForKarat(marketRates.pricesByKarat, 22),
    lastUpdated: marketRates.asOf,
    holdingsCount: holdings.length
  };
}

export function computeTierProgress(fineGoldGrams: number): TierProgress {
  const current =
    TIER_STEPS.find((step) => fineGoldGrams >= step.min && fineGoldGrams <= step.max) ?? TIER_STEPS[TIER_STEPS.length - 1];
  const nextIndex = TIER_STEPS.findIndex((step) => step.name === current.name) + 1;
  const next = TIER_STEPS[nextIndex] ?? null;

  if (!next) {
    return {
      currentTier: current.name,
      nextTier: null,
      gramsToNextTier: 0,
      tierProgressPct: 100
    };
  }

  const band = next.min - current.min;
  const progressed = fineGoldGrams - current.min;

  return {
    currentTier: current.name,
    nextTier: next.name,
    gramsToNextTier: Number(Math.max(next.min - fineGoldGrams, 0).toFixed(2)),
    tierProgressPct: Math.max(0, Math.min(100, Number(((progressed / band) * 100).toFixed(1))))
  };
}

export function computeAchievements(holdings: PortfolioHolding[]): Achievement[] {
  const totalFineGold = holdings.reduce((sum, holding) => sum + holding.fineGoldGrams, 0);
  const uniqueKarats = new Set(holdings.map((holding) => holding.karat)).size;
  const holdingsWithTags = holdings.filter((holding) => holding.tags.length > 0).length;
  const documentedHoldings = holdings.filter((holding) => holding.purchaseBasisKnown).length;

  return [
    {
      key: "first-piece",
      unlocked: holdings.length >= 1
    },
    {
      key: "10g-pure",
      unlocked: totalFineGold >= 10
    },
    {
      key: "50g-pure",
      unlocked: totalFineGold >= 50
    },
    {
      key: "100g-pure",
      unlocked: totalFineGold >= 100
    },
    {
      key: "well-documented",
      unlocked: documentedHoldings >= 3
    },
    {
      key: "collector-mix",
      unlocked: uniqueKarats >= 3
    },
    {
      key: "tagged-vault",
      unlocked: holdingsWithTags >= 5
    },
    {
      key: "quarter-kilo",
      unlocked: totalFineGold >= 250
    }
  ];
}

export function getLatestUnlockedAchievement(achievements: Achievement[]) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked);
  return unlocked.length ? unlocked[unlocked.length - 1] : null;
}

export function aggregatePortfolioHistory(holdings: PortfolioHolding[], history: QuoteHistoryPoint[]): ChartPoint[] {
  return history.map((point) => {
    const totalValueQar = holdings.reduce((sum, holding) => {
      const price = holding.karat === 22 ? point.price22k : derivePriceFrom24k(point.price24k, holding.karat);
      return sum + holding.grams * price;
    }, 0);

    return {
      asOf: point.asOf,
      totalValueQar: Number(totalValueQar.toFixed(2))
    };
  });
}

export function buildHoldingHistory(holding: PortfolioHolding, history: QuoteHistoryPoint[]): ChartPoint[] {
  return history.map((point) => {
    const price = holding.karat === 22 ? point.price22k : derivePriceFrom24k(point.price24k, holding.karat);
    return {
      asOf: point.asOf,
      totalValueQar: Number((holding.grams * price).toFixed(2))
    };
  });
}

export function filterAndSortHoldings(
  holdings: PortfolioHolding[],
  options: {
    search?: string;
    karat?: number | null;
    tag?: string | null;
    sort?: "newest" | "highest-value" | "best-gain" | "most-grams";
  }
) {
  const query = options.search?.trim().toLowerCase() ?? "";
  const filtered = holdings.filter((holding) => {
    const matchesSearch =
      !query ||
      holding.name.toLowerCase().includes(query) ||
      holding.vaultName.toLowerCase().includes(query) ||
      holding.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesKarat = options.karat ? holding.karat === options.karat : true;
    const matchesTag = options.tag ? holding.tags.includes(options.tag) : true;

    return matchesSearch && matchesKarat && matchesTag;
  });

  const sortKey = options.sort ?? "newest";
  return filtered.sort((left, right) => {
    switch (sortKey) {
      case "highest-value":
        return right.worthNowQar - left.worthNowQar;
      case "best-gain":
        return (right.gainLossQar ?? Number.NEGATIVE_INFINITY) - (left.gainLossQar ?? Number.NEGATIVE_INFINITY);
      case "most-grams":
        return right.fineGoldGrams - left.fineGoldGrams;
      case "newest":
      default:
        return new Date(right.rawItem.createdAt ?? 0).getTime() - new Date(left.rawItem.createdAt ?? 0).getTime();
    }
  });
}

export async function fetchLatestRates(layer: "market" | "retail" = "market") {
  return readJson<LatestRatesPayload>(await apiFetch(`/v1/public/quotes/latest?layer=${layer}`));
}

export async function fetchPublicHome() {
  return readJson<PublicHomePayload>(await apiFetch("/v1/public/home"));
}

export async function fetchQuoteHistory(days: number, layer: "market" | "retail" = "market") {
  const response = await readJson<{ points: QuoteHistoryPoint[] }>(
    await apiFetch(`/v1/public/quotes/history?layer=${layer}&days=${days}`)
  );
  return response.points;
}

export async function fetchVaultItems(vaultId: string) {
  const payload = await readJson<{ items: ApiVaultItem[] }>(await apiFetch(`/v1/vaults/${vaultId}/items`));
  return payload.items;
}

export async function fetchVaults() {
  const payload = await readJson<{ vaults: ApiVault[] }>(await apiFetch("/v1/vaults"));
  return payload.vaults;
}

export async function loadPortfolioState() {
  const [vaults, marketRates] = await Promise.all([fetchVaults(), fetchLatestRates("market")]);
  const records = await Promise.all(
    vaults.map(async (vault) => ({
      vault,
      items: await fetchVaultItems(vault.id)
    }))
  );

  const holdings = records.flatMap(({ vault, items }) => items.map((item) => normalizeHolding(item, vault, marketRates)));

  return {
    vaults,
    marketRates,
    holdings,
    summary: summarizePortfolio(holdings, marketRates)
  };
}
