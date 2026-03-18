import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  COOKIE_DOMAIN: z.string().default("localhost"),
  WEB_APP_HOST: z.string().default("localhost:3000"),
  APP_DEFAULT_CURRENCY: z.string().default("QAR")
});

export type ApiConfig = z.infer<typeof envSchema>;

export function getConfig(): ApiConfig {
  return envSchema.parse(process.env);
}
