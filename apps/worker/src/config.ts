import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  APP_DEFAULT_CURRENCY: z.string().default("QAR"),
  MARKET_API_PROVIDER: z.enum(["metals_api", "gold_api"]).default("metals_api"),
  MARKET_API_BASE_URL: z.string().min(1),
  MARKET_API_KEY: z.string().min(1),
  MARKET_API_TIMEOUT_MS: z.coerce.number().default(8000),
  MARKET_INGEST_EVERY_MINUTES: z.coerce.number().default(10),
  RETAIL_INGEST_EVERY_MINUTES: z.coerce.number().default(15),
  RETAIL_MALABAR_HOST: z.string().min(1),
  RETAIL_MALABAR_PATH: z.string().min(1),
  RETAIL_RATE_LIMIT_PER_MINUTE: z.coerce.number().default(1),
  ROBOTS_CACHE_TTL_HOURS: z.coerce.number().default(24),
  ALERT_WEBHOOK_URL: z.string().optional(),
  ALERT_MIN_SEVERITY: z.enum(["info", "warn", "error"]).default("warn")
});

export type WorkerConfig = z.infer<typeof envSchema>;

export function getWorkerConfig(): WorkerConfig {
  return envSchema.parse(process.env);
}
