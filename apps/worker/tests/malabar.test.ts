import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseMalabarQatarRates } from "../src/ingest/providers/retail/malabar.js";

describe("malabar parser", () => {
  it("parses qatar row", () => {
    const html = readFileSync(new URL("../../../fixtures/malabar_qatar_gold_rate.html", import.meta.url), "utf8");
    const parsed = parseMalabarQatarRates(html);

    expect(parsed.price22k).toBe(253);
    expect(parsed.price24k).toBe(276);
    expect(parsed.asOfText).toContain("2026");
  });
});
