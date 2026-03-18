import { describe, expect, it } from "vitest";

import { isPathAllowed, parseRobots } from "../src/ingest/robots/robots.js";

describe("robots", () => {
  it("denies disallowed path and allows others", () => {
    const parsed = parseRobots(`
User-agent: *
Disallow: /checkout/cart/
Allow: /
`);

    expect(isPathAllowed(parsed, "/rates/qatar")).toBe(true);
    expect(isPathAllowed(parsed, "/checkout/cart/view")).toBe(false);
  });

  it("fails closed when robots missing", () => {
    expect(() => parseRobots("Bad robots file")).toThrow();
  });
});
