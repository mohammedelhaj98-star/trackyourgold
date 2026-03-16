import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().default("tyg_session"),
  SESSION_SECRET: z.string().min(12).default("replace-me-session-secret"),
  CRON_SECRET: z.string().min(12).default("replace-me-cron-secret"),
  ADMIN_EMAIL: z.string().email().default("admin@trackyourgold.com"),
  ADMIN_PASSWORD: z.string().min(8).default("ChangeMeNow123!"),
  MALABAR_URL: z.string().url().default("https://www.malabargoldanddiamonds.com/stores/qatar"),
  MALABAR_USER_AGENT: z.string().default("TrackYourGoldBot/1.0 (+https://trackyourgold.com)"),
  SCRAPER_REQUEST_TIMEOUT_MS: z.coerce.number().default(15000),
  SCRAPER_RETRY_COUNT: z.coerce.number().default(3),
  SCRAPER_RETRY_DELAY_MS: z.coerce.number().default(2000),
  SCRAPER_SNAPSHOT_ON_SUCCESS: z.coerce.boolean().default(true),
  SCRAPER_SNAPSHOT_ON_FAILURE: z.coerce.boolean().default(true),
  MALABAR_PARSER_VERSION: z.string().default("2026-03-16"),
  GLOBAL_GOLD_PRIMARY_PROVIDER: z.string().default("alpha-vantage"),
  GLOBAL_GOLD_BACKUP_PROVIDER: z.string().default("stooq"),
  GLOBAL_FX_PRIMARY_PROVIDER: z.string().default("open-er-api"),
  GLOBAL_FX_BACKUP_PROVIDER: z.string().default("alpha-vantage"),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  GLOBAL_PRICE_REQUEST_TIMEOUT_MS: z.coerce.number().default(12000),
  SMTP_HOST: z.string().default("smtp.hostinger.com"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default("TrackYourGold <no-reply@trackyourgold.com>"),
  ADS_ENABLED: z.coerce.boolean().default(true),
  PREMIUM_ENABLED: z.coerce.boolean().default(false),
  ALLOW_USER_AD_SUPPRESSION: z.coerce.boolean().default(true),
  SUMMARY_MODE: z.enum(["rules", "llm"]).default("rules"),
  SHARE_IMAGE_BRAND: z.string().default("TrackYourGold")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed.");
}

export const env = parsed.data;
export type AppEnv = typeof env;
