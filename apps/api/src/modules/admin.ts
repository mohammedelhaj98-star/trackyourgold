import type { Prisma, PrismaClient } from "@prisma/client";

import { type AdminUiConfig, adminUiConfigSchema, type UiSettingSection, UI_SETTING_KEYS } from "@trackyourgold/shared";

import type { ApiConfig } from "../config.js";
import { hashPassword, hashToken, signAccessToken, signRefreshToken, verifyPassword } from "../lib/auth.js";
import { ApiError } from "../lib/errors.js";

const UI_SETTING_ENTRIES = Object.entries(UI_SETTING_KEYS) as [UiSettingSection, string][];
const DEFAULT_BOOTSTRAP_ADMIN = {
  username: "Admin1",
  password: "Admin1",
  email: "admin1@trackyourgold.internal"
} as const;

function toInputJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function getBootstrapAdminConfig() {
  return {
    username: process.env.BOOTSTRAP_ADMIN_USERNAME ?? DEFAULT_BOOTSTRAP_ADMIN.username,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? DEFAULT_BOOTSTRAP_ADMIN.password,
    email: process.env.BOOTSTRAP_ADMIN_EMAIL ?? DEFAULT_BOOTSTRAP_ADMIN.email
  };
}

async function ensureBootstrapAdmin(db: PrismaClient, input: { username: string; password: string }) {
  const bootstrap = getBootstrapAdminConfig();
  if (input.username !== bootstrap.username || input.password !== bootstrap.password) {
    return null;
  }

  const passwordHash = await hashPassword(bootstrap.password);
  const existingByEmail = await db.user.findUnique({
    where: { email: bootstrap.email }
  });

  if (existingByEmail) {
    return db.user.update({
      where: { id: existingByEmail.id },
      data: {
        username: bootstrap.username,
        role: "ADMIN",
        passwordHash
      }
    });
  }

  return db.user.create({
    data: {
      username: bootstrap.username,
      email: bootstrap.email,
      language: "en",
      role: "ADMIN",
      passwordHash
    }
  });
}

export async function loginAdminUser(
  db: PrismaClient,
  config: ApiConfig,
  input: { username: string; password: string }
) {
  let user = await db.user.findUnique({
    where: { username: input.username }
  });

  if (!user) {
    user = await ensureBootstrapAdmin(db, input);
  }

  if (!user || user.role !== "ADMIN") {
    throw new ApiError(401, "invalid_credentials", "Invalid admin credentials.");
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "invalid_credentials", "Invalid admin credentials.");
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

export async function getAdminMe(db: PrismaClient, userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "forbidden", "Admin access required.");
  }

  return user;
}

export async function getStoredUiConfig(db: PrismaClient) {
  const settings = await db.setting.findMany({
    where: {
      key: {
        in: UI_SETTING_ENTRIES.map(([, key]) => key)
      }
    }
  });

  const config: Partial<Record<UiSettingSection, AdminUiConfig[UiSettingSection]>> = {};
  for (const [section, key] of UI_SETTING_ENTRIES) {
    const match = settings.find((setting) => setting.key === key);
    if (match) {
      config[section] = match.value as AdminUiConfig[typeof section];
    }
  }

  return config as Partial<AdminUiConfig>;
}

export async function saveUiConfig(db: PrismaClient, input: unknown) {
  const parsed = adminUiConfigSchema.parse(input);

  await db.$transaction(
    UI_SETTING_ENTRIES.map(([section, key]) =>
      db.setting.upsert({
        where: { key },
        update: { value: toInputJsonValue(parsed[section]) },
        create: { key, value: toInputJsonValue(parsed[section]) }
      })
    )
  );

  return parsed;
}
