import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).default('dev-secret'),
  MALABAR_URL: z.string().url().default('https://www.malabargoldanddiamonds.com/gold-rate-qatar'),
  MALABAR_STORES_URL: z.string().url().default('https://www.malabargoldanddiamonds.com/stores/qatar'),
  GOLD_PROVIDER_PRIMARY: z.string().default('metalsdev'),
  GOLD_PROVIDER_BACKUP: z.string().default('goldapi'),
  FX_PROVIDER_PRIMARY: z.string().default('exchangerate-host'),
  SMTP_HOST: z.string().default('smtp.hostinger.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default('noreply@trackyourgold.com'),
  SMTP_PASS: z.string().default('changeme'),
  APP_URL: z.string().url().default('https://trackyourgold.com'),
});

let cachedEnv: z.infer<typeof schema> | null = null;

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Avoid crashing build on unrelated routes; defaults are applied where available.
    // Required runtime values should be checked with requireEnv().
    cachedEnv = schema.parse({});
    return cachedEnv;
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function requireEnv<K extends keyof z.infer<typeof schema>>(key: K) {
  const value = getEnv()[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value;
}
