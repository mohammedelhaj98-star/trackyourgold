import type { PrismaClient } from "@prisma/client";

import type { ApiConfig } from "../config.js";
import { hashPassword, hashToken, signAccessToken, signRefreshToken, verifyPassword } from "../lib/auth.js";
import { ApiError } from "../lib/errors.js";

export async function signUpUser(
  db: PrismaClient,
  config: ApiConfig,
  input: { email: string; password: string; language: "en" | "ar" }
) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "email_taken", "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: {
      email: input.email,
      passwordHash,
      language: input.language
    }
  });

  await db.vault.create({
    data: {
      ownerId: user.id,
      name: input.language === "ar" ? "خزنتي" : "My Vault",
      defaultCurrency: config.APP_DEFAULT_CURRENCY
    }
  });

  const accessToken = signAccessToken(config, {
    sub: user.id,
    email: user.email,
    language: user.language,
    role: user.role
  });
  const refreshToken = signRefreshToken(config, user.id);

  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    }
  });

  return { user, accessToken, refreshToken };
}

export async function loginUser(
  db: PrismaClient,
  config: ApiConfig,
  input: { email: string; password: string }
) {
  const user = await db.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiError(401, "invalid_credentials", "Invalid email or password.");
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "invalid_credentials", "Invalid email or password.");
  }

  const accessToken = signAccessToken(config, {
    sub: user.id,
    email: user.email,
    language: user.language,
    role: user.role
  });
  const refreshToken = signRefreshToken(config, user.id);

  await db.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    }
  });

  return { user, accessToken, refreshToken };
}
