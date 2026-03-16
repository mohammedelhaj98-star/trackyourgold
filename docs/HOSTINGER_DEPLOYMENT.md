# Hostinger Deployment Guide

This app is designed for Hostinger Node.js Web App deployment.

## 1. Prepare the environment

Required:

- Node.js 20+
- A MySQL database accessible from the Hostinger web app
- Domain pointed at the Hostinger application: `trackyourgold.com`

Important:

- Set `APP_URL=https://trackyourgold.com`
- Set a strong `SESSION_SECRET`
- Set a strong `CRON_SECRET`
- If your MySQL password contains `@`, use `%40` if the raw connection string causes parsing issues

## 2. Upload or connect the repository

Recommended:

- Connect the GitHub repository to the Hostinger Node.js app if available in your plan

Alternative:

- Upload the repository files to the application root

## 3. Configure environment variables

Use the values from `.env.example` as the template.

Minimum required production values:

- `APP_URL=https://trackyourgold.com`
- `DATABASE_URL=...`
- `SESSION_SECRET=...`
- `CRON_SECRET=...`
- `ADMIN_EMAIL=...`
- `ADMIN_PASSWORD=...`
- `MALABAR_URL=https://www.malabargoldanddiamonds.com/stores/qatar`
- `SMTP_HOST=smtp.hostinger.com`
- `SMTP_PORT=465`
- `SMTP_USER=...`
- `SMTP_PASSWORD=...`
- `SMTP_FROM=TrackYourGold <no-reply@trackyourgold.com>`

Optional but recommended:

- `ALPHA_VANTAGE_API_KEY=...`
- `GLOBAL_GOLD_PRIMARY_PROVIDER=alpha-vantage`
- `GLOBAL_GOLD_BACKUP_PROVIDER=stooq`
- `GLOBAL_FX_PRIMARY_PROVIDER=open-er-api`
- `GLOBAL_FX_BACKUP_PROVIDER=alpha-vantage`

## 4. Install and build

Run in the Hostinger application shell or deployment command flow:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run build
```

If you prefer Prisma migrations instead of `db:push`, generate them on a development machine first and commit them, then use:

```bash
npm run db:migrate
```

## 5. Start command

Use:

```bash
npm start
```

The app uses standard Next.js startup and reads `PORT` from the hosting environment.

## 6. Domain configuration

Point `trackyourgold.com` and `www.trackyourgold.com` to the Hostinger application.

Recommended:

- Force HTTPS
- Use the primary domain as `https://trackyourgold.com`
- Redirect `www` to the apex or vice versa consistently

## 7. Cron jobs in Hostinger

Create cron jobs in hPanel.

Use either a `curl` command with the secret token or any Hostinger-supported web request approach.

### Every 30 minutes: Malabar scrape

```bash
curl -fsS "https://trackyourgold.com/api/cron/ingest-malabar?token=YOUR_CRON_SECRET"
```

Schedule:

```text
*/30 * * * *
```

### Every 30 minutes: global spot and FX refresh

Run a few minutes after the local scrape if you want cleaner sequencing.

```bash
curl -fsS "https://trackyourgold.com/api/cron/ingest-market?token=YOUR_CRON_SECRET"
```

Schedule:

```text
5,35 * * * *
```

### Every 30 minutes: alert evaluation

```bash
curl -fsS "https://trackyourgold.com/api/cron/alerts?token=YOUR_CRON_SECRET"
```

Schedule:

```text
10,40 * * * *
```

### Weekly summary email

Example: every Monday at 9:00 AM Qatar time.

```bash
curl -fsS "https://trackyourgold.com/api/cron/weekly-summary?token=YOUR_CRON_SECRET"
```

Schedule example:

```text
0 9 * * 1
```

Adjust for the server timezone if Hostinger uses a timezone different from Qatar.

## 8. Admin-first post-deploy checklist

1. Login with the seeded admin account.
2. Visit `/admin/scraper` and confirm settings.
3. Visit `/admin/parser-health` after the first cron run.
4. Visit `/admin/ads` and add placeholder or real ad code.
5. Visit `/admin/premium` and confirm premium remains disabled if you are not launching it yet.
6. Visit `/admin/articles` and `/admin/seo` to start publishing content.
7. Visit `/admin/analytics` to confirm page views and signup events are recording.

## 9. Files to maintain after launch

### Scraper selectors

Update here when the Malabar DOM changes:

- `src/server/services/pricing/malabar-config.ts`

Also bump:

- `MALABAR_PARSER_VERSION`

### Ad code

Primary update path:

- `/admin/ads`

Runtime rendering logic:

- `src/components/layout/ad-slot.tsx`

### SEO template behavior

Key files:

- `src/server/data/market.ts`
- `src/server/data/content.ts`
- `src/app/(public)/live/[country]/[karat]/page.tsx`
- `src/app/(public)/history/[country]/[karat]/page.tsx`
- `src/app/(public)/best-time-to-buy/[country]/page.tsx`
- `src/app/(public)/guides/[country]/buying/page.tsx`
- `src/app/(public)/countries/[country]/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`

## 10. Recommended first production additions

After the base deployment is stable, the most leverage-heavy next steps are:

1. Add more stores and comparison content
2. Add more countries and cities
3. Add more article volume in the Gold Insights hub
4. Connect a real payment provider for premium
5. Add richer affiliate blocks and comparison tables
