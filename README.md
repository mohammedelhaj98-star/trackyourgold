# TrackYourGold

TrackYourGold is a production-oriented full-stack web application for `trackyourgold.com`.

It is built as a real SEO-driven product, not a private-only dashboard. The repository includes:

- Public indexable price pages
- Historical trend pages
- Country, city, store, guide, FAQ, article, and calculator routes
- Multi-user authentication and private dashboard tooling
- Admin surfaces for content, monetization, settings, and system health
- Scraping and ingestion services for Malabar Gold & Diamonds Qatar and global reference data
- Weighted recommendation engine with editable settings
- Alert architecture for email and dashboard notifications
- Premium, affiliate, and ad monetization architecture from day one

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS
- Recharts
- Custom secure session authentication
- Nodemailer with Hostinger SMTP defaults

## Core Product Areas

### Public SEO architecture

Public routes are designed to be indexable and scalable:

- `/`
- `/live/[country]/[karat]`
- `/history/[country]/[karat]`
- `/best-time-to-buy/[country]`
- `/guides/[country]/buying`
- `/analysis/[country]`
- `/karats/[country]/[karat]`
- `/countries/[country]`
- `/countries/[country]/cities/[city]`
- `/stores/[country]/[city]/[slug]`
- `/compare/[country]/[city]`
- `/gold-insights`
- `/gold-insights/[slug]`
- `/faq`
- `/calculators/[slug]`
- `/alerts`

These pages include metadata, canonical tags, Open Graph, Twitter metadata, schema markup, internal links, and long-form explanatory sections so the site can rank for country, city, karat, calculator, guide, and timing-intent queries over time.

### Private product area

Private routes include:

- `/dashboard`
- `/portfolio`
- `/alerts/settings`
- `/saved`

These pages support account-based ad suppression, portfolio tracking, saved analysis, and user alert management.

### Admin area

Admin routes include:

- `/admin`
- `/admin/scraper`
- `/admin/parser-health`
- `/admin/ads`
- `/admin/seo`
- `/admin/articles`
- `/admin/users`
- `/admin/premium`
- `/admin/analytics`
- `/admin/logs`

## Repository Structure

```text
trackyourgold/
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- docs/
|   `-- HOSTINGER_DEPLOYMENT.md
|-- src/
|   |-- app/
|   |   |-- (public)/...
|   |   |-- (auth)/...
|   |   |-- (dashboard)/...
|   |   |-- admin/...
|   |   |-- api/...
|   |   |-- layout.tsx
|   |   |-- robots.ts
|   |   `-- sitemap.ts
|   |-- components/
|   |   |-- admin/
|   |   |-- charts/
|   |   |-- dashboard/
|   |   |-- forms/
|   |   |-- layout/
|   |   `-- ui/
|   |-- lib/
|   |   |-- auth/
|   |   |-- ads.ts
|   |   |-- calculators.ts
|   |   |-- cron.ts
|   |   |-- db.ts
|   |   |-- env.ts
|   |   |-- seo.ts
|   |   `-- utils.ts
|   `-- server/
|       |-- actions/
|       |-- data/
|       `-- services/
|           |-- alerts/
|           `-- pricing/
|-- .env.example
|-- next.config.mjs
|-- package.json
|-- tailwind.config.ts
`-- tsconfig.json
```

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill in `DATABASE_URL`, `SESSION_SECRET`, `CRON_SECRET`, SMTP values, and any API keys.
3. Install dependencies:
   - `npm install`
4. Generate Prisma client:
   - `npm run db:generate`
5. Sync schema to your database:
   - `npm run db:push`
6. Seed initial data:
   - `npm run db:seed`
7. Run locally:
   - `npm run dev`

Seeded accounts:

- Admin email comes from `ADMIN_EMAIL`
- Admin password comes from `ADMIN_PASSWORD`
- Demo user: `demo@trackyourgold.com` / `DemoUser123!`

## Environment Notes

If your MySQL password contains special characters like `@`, Prisma can require URL encoding depending on the parser and shell path. For example, `Demmahom@98` can be written as `Demmahom%4098` if needed.

## Data Ingestion

### Malabar scraper

The Malabar source is handled in:

- `src/server/services/pricing/malabar.ts`
- `src/server/services/pricing/malabar-config.ts`

Design choices:

- Dynamic karat detection instead of hardcoding only `22K` and `24K`
- Raw HTML snapshot storage for debugging and parser recovery
- Source timestamp capture when available
- Scrape timestamp capture on every run
- Parser version tracking through `MALABAR_PARSER_VERSION`
- Retry and failure logging
- Parser failure records in the admin panel

### Global reference data

Global reference ingestion is handled in:

- `src/server/services/pricing/global.ts`

Current provider architecture:

- Gold primary: `alpha-vantage`
- Gold backup: `stooq`
- FX primary: `open-er-api`
- FX backup: `alpha-vantage`

Providers are environment-configurable so more sources can be added later without changing the page layer.

## Recommendation Engine

The weighted recommendation engine lives in:

- `src/server/services/pricing/recommendation.ts`

Current signals:

- Price below 30-day average
- Price below 90-day average
- Significant 24-hour drop
- Near 90-day low
- Sharp-spike penalty
- Premium-over-spot penalty
- Recent volatility penalty

Outputs:

- Label: `Strong Buy`, `Buy`, `Wait`, `Avoid`
- Score
- Confidence-style wording
- Reason breakdown
- Plain-language explanation

Default weights and thresholds are seeded into the `settings` table and editable from the admin area.

## Alerts

Alert architecture is implemented in:

- `src/server/services/alerts/alerts.ts`
- `src/server/services/alerts/mailer.ts`

Supported alert types:

- Price drop alerts
- New 90-day low alerts
- Weekly summary emails

SMTP defaults target Hostinger SMTP through environment variables.

## Monetization Architecture

### Ads

Reusable ad slots are stored in the database and rendered via:

- Runtime component: `src/components/layout/ad-slot.tsx`
- Admin editor: `/admin/ads`

To update ad behavior:

1. Edit slot records in `/admin/ads`
2. Add AdSense or other network code into the slot’s `customCode`
3. If you need runtime rendering changes, update `src/components/layout/ad-slot.tsx`

### Affiliate readiness

Affiliate-ready models include:

- `stores`
- `store_affiliate_links`
- `affiliate_clicks`
- Future-ready comparison pages under `/compare/...`

### Premium readiness

Premium launch architecture is controlled through settings and user plan state:

- `users.plan`
- `settings` records such as `premium.enabled`
- `/admin/premium`

Payments are not wired yet, but the access model and segmentation points already exist.

## SEO Template Notes

SEO generation is a combination of route templates plus content records.

### Route templates

Route templates handle scalable patterns like:

- `22kt gold price in Qatar today`
- `gold price history in Qatar`
- `best time to buy gold in Qatar`
- `gold buying guide in Qatar`
- `22K gold explainer in Qatar`
- `gold store comparison in Doha`

### CMS-backed content

Structured long-form content is stored in:

- `content_pages`
- `blog_articles`
- `faqs`
- `seo_metadata`

Admin pages for these live under `/admin/seo` and `/admin/articles`.

## Cron Endpoints

Secure cron endpoints:

- `/api/cron/ingest-malabar`
- `/api/cron/ingest-market`
- `/api/cron/alerts`
- `/api/cron/weekly-summary`

Each route accepts either:

- `Authorization: Bearer <CRON_SECRET>`
- `?token=<CRON_SECRET>`

## Hostinger Deployment

See `docs/HOSTINGER_DEPLOYMENT.md`.

## Known Operational Note

The repository includes the Prisma schema and seed data. In this workspace I was not able to run Prisma migration generation because dependencies were not installed, so the source of truth is currently `prisma/schema.prisma`. On a machine with dependencies installed, generate the first migration with:

- `npx prisma migrate dev --name init`

For Hostinger deployment, `npm run db:push` is also documented as the simplest initial schema sync path.
