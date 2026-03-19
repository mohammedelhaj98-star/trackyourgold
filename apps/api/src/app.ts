import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";

import {
  adminLoginSchema,
  createVaultItemSchema,
  createVaultSchema,
  latestRatesQuerySchema,
  loginSchema,
  signUpSchema,
  updateVaultItemSchema,
  valuationHistoryQuerySchema,
  valuationQuerySchema
} from "@trackyourgold/shared";
import { getPrismaClient } from "@trackyourgold/db";

import { getConfig } from "./config.js";
import {
  clearSessionCookies,
  hashToken,
  readTokens,
  requireAccessToken,
  requireAdminAccessToken,
  setSessionCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "./lib/auth.js";
import { toErrorPayload } from "./lib/errors.js";
import { loginUser, signUpUser } from "./modules/auth.js";
import { getAdminMe, getStoredUiConfig, loginAdminUser, saveUiConfig } from "./modules/admin.js";
import { getLatestRates, getMarkets, getPublicHome, getQuoteHistory, getSourceStatus } from "./modules/public.js";
import {
  createVault,
  createVaultItem,
  deleteVaultItem,
  getOwnedItem,
  getOwnedVault,
  getUserVaults,
  getVaultValuation,
  getVaultValuationHistory,
  listVaultItems,
  updateVaultItem
} from "./modules/vaults.js";

function buildOrigin(host: string) {
  const scheme = host.includes("localhost") ? "http:" : "https:";
  return `${scheme}//${host}`;
}

export function buildApp() {
  const config = getConfig();
  const db = getPrismaClient();
  const app = Fastify({ logger: true });

  const revokeRefreshToken = async (refreshToken?: string) => {
    if (!refreshToken) {
      return;
    }

    await db.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken) },
      data: { revokedAt: new Date() }
    });
  };

  app.register(cookie);
  app.register(cors, {
    origin: buildOrigin(config.WEB_APP_HOST),
    credentials: true
  });

  app.setErrorHandler((error, _request, reply) => {
    const normalized = toErrorPayload(error);
    reply.status(normalized.statusCode).send(normalized.payload);
  });

  app.get("/v1/health", () => ({
    status: "ok",
    env: config.APP_ENV
  }));

  app.get("/v1/public/home", async () => getPublicHome(db));
  app.get("/v1/public/markets", async () => ({ markets: await getMarkets(db) }));
  app.get("/v1/public/ui-config", async () => ({ config: await getStoredUiConfig(db) }));
  app.get("/v1/public/quotes/latest", async (request, reply) => {
    const query = latestRatesQuerySchema.parse(request.query);
    reply.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return getLatestRates(db, query.layer);
  });
  app.get("/v1/public/quotes/history", async (request) => {
    const query = valuationHistoryQuerySchema.parse(request.query);
    const layer = (request.query as Record<string, string | undefined>).layer === "retail" ? "retail" : "market";
    return { points: await getQuoteHistory(db, layer, query.days) };
  });
  app.get("/v1/sources/status", async () => ({ sources: await getSourceStatus(db) }));

  app.post("/v1/auth/signup", async (request, reply) => {
    const input = signUpSchema.parse(request.body);
    const result = await signUpUser(db, config, input);
    setSessionCookies(reply, config, result.accessToken, result.refreshToken);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        language: result.user.language
      },
      session: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    };
  });

  app.post("/v1/auth/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const result = await loginUser(db, config, input);
    setSessionCookies(reply, config, result.accessToken, result.refreshToken);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        language: result.user.language
      },
      session: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    };
  });

  app.post("/v1/auth/logout", async (request, reply) => {
    const { refreshToken } = readTokens(request);
    await revokeRefreshToken(refreshToken);

    clearSessionCookies(reply, config);
    return { ok: true };
  });

  app.post("/v1/auth/refresh", async (request, reply) => {
    const { refreshToken } = readTokens(request);
    if (!refreshToken) {
      reply.status(401);
      return { error: { code: "unauthorized", message: "Missing refresh token." } };
    }

    const payload = verifyRefreshToken(config, refreshToken);
    const tokenRecord = await db.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash: hashToken(refreshToken),
        revokedAt: null
      },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      clearSessionCookies(reply, config);
      reply.status(401);
      return { error: { code: "refresh_expired", message: "Refresh token expired." } };
    }

    const accessToken = signAccessToken(config, {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      language: tokenRecord.user.language,
      role: tokenRecord.user.role
    });
    const newRefreshToken = signRefreshToken(config, tokenRecord.user.id);

    await db.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        tokenHash: hashToken(newRefreshToken),
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
      }
    });

    setSessionCookies(reply, config, accessToken, newRefreshToken);
    return {
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        language: tokenRecord.user.language
      },
      session: {
        accessToken,
        refreshToken: newRefreshToken
      }
    };
  });

  app.post("/v1/admin/auth/login", async (request, reply) => {
    const input = adminLoginSchema.parse(request.body);
    const result = await loginAdminUser(db, config, input);
    setSessionCookies(reply, config, result.accessToken, result.refreshToken);

    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        language: result.user.language,
        role: result.user.role
      },
      session: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    };
  });

  app.post("/v1/admin/auth/logout", async (request, reply) => {
    requireAdminAccessToken(request, config);
    const { refreshToken } = readTokens(request);
    await revokeRefreshToken(refreshToken);
    clearSessionCookies(reply, config);
    return { ok: true };
  });

  app.get("/v1/admin/me", async (request) => {
    const session = requireAdminAccessToken(request, config);
    const user = await getAdminMe(db, session.sub);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        language: user.language,
        role: user.role
      }
    };
  });

  app.get("/v1/admin/ui-config", async (request) => {
    requireAdminAccessToken(request, config);
    return { config: await getStoredUiConfig(db) };
  });

  app.put("/v1/admin/ui-config", async (request) => {
    requireAdminAccessToken(request, config);
    return { config: await saveUiConfig(db, request.body) };
  });

  app.get("/v1/me", async (request) => {
    const session = requireAccessToken(request, config);
    const [user, defaultVault] = await Promise.all([
      db.user.findUniqueOrThrow({ where: { id: session.sub } }),
      db.vault.findFirst({ where: { ownerId: session.sub }, orderBy: { createdAt: "asc" } })
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        language: user.language
      },
      defaultVaultId: defaultVault?.id ?? null
    };
  });

  app.get("/v1/vaults", async (request) => {
    const session = requireAccessToken(request, config);
    return { vaults: await getUserVaults(db, session.sub) };
  });

  app.post("/v1/vaults", async (request) => {
    const session = requireAccessToken(request, config);
    const input = createVaultSchema.parse(request.body);
    return { vault: await createVault(db, session.sub, input.name) };
  });

  app.get("/v1/vaults/:vaultId", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { vaultId: string };
    return { vault: await getOwnedVault(db, session.sub, params.vaultId) };
  });

  app.get("/v1/vaults/:vaultId/items", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { vaultId: string };
    return { items: await listVaultItems(db, session.sub, params.vaultId) };
  });

  app.post("/v1/vaults/:vaultId/items", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { vaultId: string };
    const input = createVaultItemSchema.parse(request.body);
    return { item: await createVaultItem(db, session.sub, params.vaultId, input) };
  });

  app.get("/v1/items/:itemId", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { itemId: string };
    return { item: await getOwnedItem(db, session.sub, params.itemId) };
  });

  app.patch("/v1/items/:itemId", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { itemId: string };
    const input = updateVaultItemSchema.parse(request.body);
    return { item: await updateVaultItem(db, session.sub, params.itemId, input) };
  });

  app.delete("/v1/items/:itemId", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { itemId: string };
    await deleteVaultItem(db, session.sub, params.itemId);
    return { ok: true };
  });

  app.get("/v1/vaults/:vaultId/valuation", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { vaultId: string };
    const query = valuationQuerySchema.parse(request.query);
    return getVaultValuation(
      db,
      session.sub,
      params.vaultId,
      query.mode as "intrinsic" | "retail" | "sell_est",
      query.sellSpreadPct,
      Number(process.env.VALUATION_CACHE_TTL_SECONDS ?? 90)
    );
  });

  app.get("/v1/vaults/:vaultId/valuation/history", async (request) => {
    const session = requireAccessToken(request, config);
    const params = request.params as { vaultId: string };
    const query = valuationHistoryQuerySchema.parse(request.query);
    return getVaultValuationHistory(
      db,
      session.sub,
      params.vaultId,
      query.mode as "intrinsic" | "retail" | "sell_est",
      query.days,
      0.03
    );
  });

  return app;
}
