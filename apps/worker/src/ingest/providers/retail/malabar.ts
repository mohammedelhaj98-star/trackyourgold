import { load } from "cheerio";

export type MalabarRetailResult = {
  asOfText: string;
  price22k: number;
  price24k: number;
};

function parseAmount(input: string) {
  const normalized = input.replace(/[^0-9.]/g, "");
  return Number(normalized);
}

export function parseMalabarQatarRates(html: string): MalabarRetailResult {
  const $ = load(html);
  const bodyText = $("body").text();
  const timestampMatch = bodyText.match(/Last\s*Updated[^0-9]*([0-9][^<\n\r]+)/i);
  const asOfText = timestampMatch?.[1]?.trim() ?? "Unknown";

  let result: MalabarRetailResult | null = null;

  $("tr").each((_index, row) => {
    const cells = $(row)
      .find("th, td")
      .map((_, cell) => $(cell).text().trim())
      .get();

    const joined = cells.join(" ").toLowerCase();
    if (!joined.includes("qatar")) {
      return;
    }

    const numericCells = cells
      .map(parseAmount)
      .filter((value) => Number.isFinite(value) && value > 0);

    if (numericCells.length >= 2) {
      result = {
        asOfText,
        price22k: numericCells[0]!,
        price24k: numericCells[1]!
      };
    }
  });

  if (!result) {
    throw new Error("Could not find Qatar row.");
  }

  return result;
}
