import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findUniqueOrThrow: vi.fn()
  },
  vault: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn()
  },
  vaultItem: {
    create: vi.fn()
  },
  refreshToken: {
    create: vi.fn(),
    updateMany: vi.fn()
  },
  priceSource: {
    findUnique: vi.fn()
  },
  priceNormalized: {
    findFirst: vi.fn()
  },
  setting: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn()
  },
  sourceHealth: {
    findMany: vi.fn()
  },
  market: {
    findMany: vi.fn()
  },
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations))
};

vi.mock("@trackyourgold/db", () => ({
  getPrismaClient: () => mockDb
}));

describe("api", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.APP_ENV = "test";
    process.env.DATABASE_URL = "test";
    process.env.JWT_ACCESS_SECRET = "0123456789abcdef";
    process.env.JWT_REFRESH_SECRET = "abcdef0123456789";
    process.env.WEB_APP_HOST = "localhost:3000";
    process.env.COOKIE_DOMAIN = "localhost";
  });

  it("denies unauthenticated vault access", async () => {
    const { buildApp } = await import("../src/app.js");
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/vaults"
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("creates a vault for an authenticated user through the module", async () => {
    const { createVault } = await import("../src/modules/vaults.js");
    mockDb.vault.create.mockResolvedValue({
      id: "vault-1",
      ownerId: "user-1",
      name: "Primary",
      defaultCurrency: "QAR"
    });

    const vault = await createVault(mockDb as never, "user-1", "Primary");
    expect(vault.name).toBe("Primary");
  });

  it("creates an item for an owned vault through the module", async () => {
    const { createVaultItem } = await import("../src/modules/vaults.js");
    mockDb.vault.findFirst.mockResolvedValue({
      id: "vault-1",
      ownerId: "user-1"
    });
    mockDb.vaultItem.create.mockResolvedValue({
      id: "item-1",
      itemName: "Bracelet"
    });

    const item = await createVaultItem(mockDb as never, "user-1", "vault-1", {
      itemName: "Bracelet",
      category: "JEWELRY",
      purityKarat: 22,
      grossWeightG: 10,
      stoneWeightG: 2,
      purchaseDate: "2026-03-18",
      purchaseTotalPriceQar: 5000,
      makingChargesQar: 0,
      vatQar: 0
    });

    expect(item.itemName).toBe("Bracelet");
  });

  it("returns latest rates shape from the public module", async () => {
    const { getLatestRates } = await import("../src/modules/public.js");
    mockDb.priceSource.findUnique.mockResolvedValue({
      id: "source-1",
      code: "market_metalsapi",
      name: "Metals API"
    });
    mockDb.priceNormalized.findFirst.mockResolvedValue({
      asOf: new Date("2026-03-18T10:00:00.000Z"),
      currency: "QAR",
      unit: "per_gram",
      price24kPerGram: 276,
      price23kPerGram: null,
      price22kPerGram: 253,
      price21kPerGram: null,
      price18kPerGram: null,
      price14kPerGram: null,
      price12kPerGram: null,
      price10kPerGram: null,
      price9kPerGram: null,
      price8kPerGram: null
    });

    const rates = await getLatestRates(mockDb as never, "market");
    expect(rates.pricesByKarat["22K"]).toBe(253);
    expect(rates.source.code).toBe("market_metalsapi");
  });

  it("logs in an admin by username", async () => {
    const { hashPassword } = await import("../src/lib/auth.js");
    const passwordHash = await hashPassword("Admin1");
    mockDb.user.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "Admin1",
      email: "admin1@trackyourgold.internal",
      passwordHash,
      language: "en",
      role: "ADMIN"
    });
    mockDb.refreshToken.create.mockResolvedValue({
      id: "refresh-1"
    });

    const { buildApp } = await import("../src/app.js");
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/auth/login",
      payload: {
        username: "Admin1",
        password: "Admin1"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.username).toBe("Admin1");
    await app.close();
  });

  it("forbids non-admin access to admin config", async () => {
    const { buildApp } = await import("../src/app.js");
    const { getConfig } = await import("../src/config.js");
    const { signAccessToken } = await import("../src/lib/auth.js");
    const app = buildApp();
    const token = signAccessToken(getConfig(), {
      sub: "user-1",
      email: "user@example.com",
      language: "en",
      role: "USER"
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/ui-config",
      cookies: {
        tyg_access_token: token
      }
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("returns stored public ui config", async () => {
    const { buildApp } = await import("../src/app.js");
    mockDb.setting.findMany.mockResolvedValue([
      {
        key: "ui.theme",
        value: {
          accentColor: "#efc97d",
          softAccentColor: "#c19b52",
          heroGradientStart: "#efc97d",
          heroGradientEnd: "#7f96ff"
        }
      }
    ]);

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/public/ui-config"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().config.theme.accentColor).toBe("#efc97d");
    await app.close();
  });
});
