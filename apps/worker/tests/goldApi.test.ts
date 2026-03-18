import { afterEach, describe, expect, it, vi } from "vitest";

import { GoldApiProvider } from "../src/ingest/providers/market/goldApi.js";

describe("gold api provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps gram fields from the gold api payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: 1773866749,
          price_gram_24k: 154.9973,
          price_gram_22k: 142.0809,
          price_gram_21k: 135.6226,
          price_gram_18k: 116.248,
          price_gram_14k: 90.4151,
          price_gram_10k: 64.5822
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new GoldApiProvider({
      baseUrl: "https://www.goldapi.io/api/XAU/QAR",
      apiKey: "secret",
      timeoutMs: 8000
    });

    const result = await provider.getMarketCaratRates("QAR");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL("https://www.goldapi.io/api/XAU/QAR"));
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: {
        "x-access-token": "secret",
        "content-type": "application/json"
      }
    });
    expect(result.ratesByKarat["24K"]).toBe(154.9973);
    expect(result.ratesByKarat["22K"]).toBe(142.0809);
    expect(result.ratesByKarat["21K"]).toBe(135.6226);
    expect(result.ratesByKarat["12K"]).toBeCloseTo(77.49865, 5);
    expect(result.unit).toBe("per_gram");
  });
});
