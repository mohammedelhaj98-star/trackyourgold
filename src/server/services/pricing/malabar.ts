import "server-only";

import * as cheerio from "cheerio";
import { SnapshotStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { slugify } from "@/lib/utils";
import { MALABAR_SELECTOR_CONFIG } from "@/server/services/pricing/malabar-config";

type ParsedKaratRate = {
  karatLabel: string;
  purityPct: number | null;
  currencyCode: string;
  pricePerGram: number;
};

type ParsedMalabarPage = {
  rates: ParsedKaratRate[];
  sourceTimestamp: Date | null;
  diagnostics: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inferPurity(karatLabel: string) {
  const numeric = Number(karatLabel.replace(/[^0-9.]/g, ""));
  if (!numeric) return null;
  return Number(((numeric / 24) * 100).toFixed(2));
}

function normalizeKaratLabel(raw: string) {
  const matched = raw.match(/(\d{1,2})/);
  return matched ? `${matched[1]}K` : raw.trim().toUpperCase();
}

function parseTimestamp(text: string | undefined) {
  if (!text) return null;
  const candidate = new Date(text);
  if (Number.isNaN(candidate.getTime())) return null;
  return candidate;
}

function parseQatarCountryTable($: cheerio.CheerioAPI) {
  const table = $("table.table_othercountry").first();
  if (!table.length) {
    return null;
  }

  const rows = table.find("tr").toArray();
  if (!rows.length) {
    return null;
  }

  const headerCells = $(rows[0])
    .find("td, th")
    .toArray()
    .map((cell) => $(cell).text().replace(/\s+/g, " ").trim());
  const karatHeaders = headerCells
    .slice(1)
    .map((cell) => normalizeKaratLabel(cell))
    .filter(Boolean);
  const rates: ParsedKaratRate[] = [];
  let sourceTimestamp: Date | null = null;

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const cells = $(row).find("td").toArray();
    if (cells.length < 3) {
      continue;
    }

    const rowText = cells.map((cell) => $(cell).text().replace(/\s+/g, " ").trim()).join(" ");
    const countryLabel = $(cells[0]).text().replace(/\s+/g, " ").trim();
    const isQatarRow = /qatar/i.test(countryLabel) || /QAR/i.test(rowText);
    if (!isQatarRow) {
      continue;
    }

    rates.length = 0;

    for (let cellIndex = 1; cellIndex < cells.length; cellIndex += 1) {
      const cellText = $(cells[cellIndex]).text().replace(/\s+/g, " ").trim();
      const karatLabel = karatHeaders[cellIndex - 1] ?? normalizeKaratLabel(cellText);
      const numeric = Number(cellText.match(/([0-9]+(?:\.[0-9]+)?)/)?.[1]);
      const currencyCode = cellText.match(/\b([A-Z]{3})\b/)?.[1] ?? "QAR";

      if (!karatLabel || !numeric || Number.isNaN(numeric)) {
        continue;
      }

      rates.push({
        karatLabel,
        purityPct: inferPurity(karatLabel),
        currencyCode,
        pricePerGram: numeric
      });
    }

    const nextRowText = $(rows[index + 1] ?? [])
      .find("td")
      .toArray()
      .map((cell) => $(cell).text().replace(/\s+/g, " ").trim())
      .join(" ");
    sourceTimestamp = parseTimestamp(nextRowText) ?? sourceTimestamp;
    break;
  }

  if (!rates.length) {
    return null;
  }

  return {
    rates: rates.filter((rate) => rate.currencyCode === "QAR"),
    sourceTimestamp
  };
}

export function parseMalabarHtml(html: string): ParsedMalabarPage {
  const $ = cheerio.load(html);
  const diagnostics: string[] = [];

  const tableResult = parseQatarCountryTable($);
  if (tableResult?.rates.length) {
    return {
      rates: tableResult.rates.sort((a, b) => a.karatLabel.localeCompare(b.karatLabel, undefined, { numeric: true })),
      sourceTimestamp: tableResult.sourceTimestamp,
      diagnostics
    };
  }

  const results = new Map<string, ParsedKaratRate>();

  for (const selector of MALABAR_SELECTOR_CONFIG.rowSelectors) {
    $(selector).each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      if (!text) return;
      const karatMatch = text.match(MALABAR_SELECTOR_CONFIG.karatRegex);
      if (!karatMatch) return;

      const karatLabel = normalizeKaratLabel(karatMatch[0]);
      const priceMatch = text.match(MALABAR_SELECTOR_CONFIG.priceRegex);
      let numericPrice = priceMatch ? Number(priceMatch[1]) : NaN;

      if (!numericPrice || Number.isNaN(numericPrice)) {
        const numericValues = [...text.matchAll(MALABAR_SELECTOR_CONFIG.fallbackNumberRegex)].map((match) => Number(match[1]));
        numericPrice = numericValues.filter((value) => value > 20 && value < 1000).at(-1) ?? NaN;
      }

      if (!numericPrice || Number.isNaN(numericPrice)) {
        diagnostics.push(`Unable to parse price for ${karatLabel} from row: ${text.slice(0, 120)}`);
        return;
      }

      results.set(karatLabel, {
        karatLabel,
        purityPct: inferPurity(karatLabel),
        currencyCode: "QAR",
        pricePerGram: numericPrice
      });
    });
  }

  let sourceTimestamp: Date | null = null;
  for (const selector of MALABAR_SELECTOR_CONFIG.timestampSelectors) {
    if (sourceTimestamp) break;
    const node = $(selector).first();
    if (!node.length) continue;
    sourceTimestamp =
      parseTimestamp(node.attr("datetime")) ??
      parseTimestamp(node.attr("data-last-updated")) ??
      parseTimestamp(node.text());
  }

  if (!results.size) {
    diagnostics.push("No karat rows detected. Review selector config or inspect raw snapshot.");
  }

  return {
    rates: [...results.values()].sort((a, b) => a.karatLabel.localeCompare(b.karatLabel, undefined, { numeric: true })),
    sourceTimestamp,
    diagnostics
  };
}

async function fetchMalabarHtml() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= env.SCRAPER_RETRY_COUNT; attempt += 1) {
    try {
      const response = await fetch(env.MALABAR_URL, {
        headers: {
          "user-agent": env.MALABAR_USER_AGENT,
          accept: "text/html,application/xhtml+xml"
        },
        signal: AbortSignal.timeout(env.SCRAPER_REQUEST_TIMEOUT_MS),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Malabar source responded with ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < env.SCRAPER_RETRY_COUNT) {
        await sleep(env.SCRAPER_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown Malabar fetch failure.");
}

export async function fetchLiveMalabarRates() {
  const html = await fetchMalabarHtml();
  const parsed = parseMalabarHtml(html);

  return {
    html,
    ...parsed
  };
}

export async function ingestMalabarRates() {
  const country = await db.country.findUnique({ where: { slug: "qatar" } });
  const store = await db.store.findFirst({ where: { countryId: country?.id, isPrimarySource: true } });

  if (!country || !store) {
    throw new Error("Primary Qatar store is not configured.");
  }

  try {
    const { html, ...parsed } = await fetchLiveMalabarRates();
    const status = parsed.rates.length ? SnapshotStatus.SUCCESS : SnapshotStatus.FAILED;

    const rawSnapshot =
      env.SCRAPER_SNAPSHOT_ON_SUCCESS || status !== SnapshotStatus.SUCCESS
        ? await db.rawScrapeSnapshot.create({
            data: {
              storeId: store.id,
              url: env.MALABAR_URL,
              html,
              status,
              parserVersion: env.MALABAR_PARSER_VERSION,
              sourceTimestamp: parsed.sourceTimestamp,
              scrapeTimestamp: new Date(),
              detectedKarats: parsed.rates.map((rate) => rate.karatLabel),
              notes: parsed.diagnostics.join(" | ") || null
            }
          })
        : null;

    if (!parsed.rates.length) {
      await db.parserFailure.create({
        data: {
          storeId: store.id,
          parserVersion: env.MALABAR_PARSER_VERSION,
          message: "Malabar parser returned zero rates.",
          selectorKey: slugify(MALABAR_SELECTOR_CONFIG.rowSelectors[0]),
          htmlSnapshotId: rawSnapshot?.id
        }
      });

      await db.systemLog.create({
        data: {
          level: "ERROR",
          category: "scraper",
          message: "Malabar scraper returned zero detected karats.",
          metadataJson: { diagnostics: parsed.diagnostics }
        }
      });

      return {
        ok: false,
        status,
        detectedKarats: [],
        diagnostics: parsed.diagnostics
      };
    }

    await db.goldPriceSnapshot.createMany({
      data: parsed.rates.map((rate) => ({
        countryId: country.id,
        storeId: store.id,
        rawSnapshotId: rawSnapshot?.id,
        sourceKind: "STORE",
        karatLabel: rate.karatLabel,
        purityPct: rate.purityPct,
        metricUnit: "gram",
        currencyCode: rate.currencyCode,
        pricePerGram: rate.pricePerGram,
        sourceTimestamp: parsed.sourceTimestamp,
        scrapeTimestamp: new Date(),
        capturedAt: new Date(),
        parserVersion: env.MALABAR_PARSER_VERSION,
        scrapeStatus: status,
        isStale: false,
        metadataJson: { diagnostics: parsed.diagnostics }
      }))
    });

    await db.systemLog.create({
      data: {
        level: "INFO",
        category: "scraper",
        message: `Malabar scraper captured ${parsed.rates.length} karat rates.`,
        metadataJson: {
          karats: parsed.rates.map((item) => item.karatLabel),
          parserVersion: env.MALABAR_PARSER_VERSION
        }
      }
    });

    return {
      ok: true,
      status,
      detectedKarats: parsed.rates.map((rate) => rate.karatLabel),
      diagnostics: parsed.diagnostics,
      sourceTimestamp: parsed.sourceTimestamp
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Malabar scrape failure.";

    const rawSnapshot = env.SCRAPER_SNAPSHOT_ON_FAILURE
      ? await db.rawScrapeSnapshot.create({
          data: {
            storeId: store.id,
            url: env.MALABAR_URL,
            html: `<!-- fetch failure: ${message} -->`,
            status: SnapshotStatus.FAILED,
            parserVersion: env.MALABAR_PARSER_VERSION,
            scrapeTimestamp: new Date(),
            notes: message
          }
        })
      : null;

    await db.parserFailure.create({
      data: {
        storeId: store.id,
        parserVersion: env.MALABAR_PARSER_VERSION,
        message,
        selectorKey: "network",
        htmlSnapshotId: rawSnapshot?.id
      }
    });

    await db.systemLog.create({
      data: {
        level: "ERROR",
        category: "scraper",
        message,
        metadataJson: { source: env.MALABAR_URL }
      }
    });

    return {
      ok: false,
      status: SnapshotStatus.FAILED,
      detectedKarats: [],
      diagnostics: [message]
    };
  }
}
