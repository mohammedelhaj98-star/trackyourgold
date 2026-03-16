import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1).default('dev-secret'),
  MALABAR_URL: z.string().url(),
  GOLD_PROVIDER_PRIMARY: z.string().default('metalsdev'),
  GOLD_PROVIDER_BACKUP: z.string().default('goldapi'),
  FX_PROVIDER_PRIMARY: z.string().default('exchangerate-host'),
  SMTP_HOST: z.string().default('smtp.hostinger.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default('noreply@trackyourgold.com'),
  SMTP_PASS: z.string().default('changeme'),
  APP_URL: z.string().url().default('https://trackyourgold.com'),
});

export const env = schema.parse(process.env);
