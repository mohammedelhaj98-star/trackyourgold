# TrackYourGold

Production-ready foundation for **trackyourgold.com** built with Next.js + TypeScript + Prisma + MySQL, designed for Hostinger Node.js Web App deployment.

## What is included
- Public SEO architecture (country, city, store, guide, FAQ, calculator, analysis, history, live price pages).
- Multi-user architecture with role-ready schema (`VISITOR`, `USER`, `ADMIN`).
- Premium-ready subscription and ad suppression logic.
- Malabar scraper module with centralized selectors and parser versioning.
- Global reference ingestion hooks (XAU/USD + USD/QAR provider architecture).
- Weighted recommendation engine (Strong Buy / Buy / Wait / Avoid).
- Lead capture + alert API foundations.
- Admin section scaffolding for scraper, parser health, ads, SEO, content, analytics, premium toggles.
- Sitemap + robots + metadata-first app shell.

## Repository structure

```text
trackyourgold/
  src/
    app/
      (public)/...                      # Public SEO routes
      dashboard/...                     # Registered user tools
      admin/...                         # Admin pages
      api/...                           # API routes for ingestion/alerts/recommendations
      sitemap.ts, robots.ts
    components/
      ads/, forms/, layout/, seo/, shared/
    lib/
      config/, scraping/, recommendation/, seo/, db/
    styles/globals.css
  prisma/
    schema.prisma
    seed.ts
  scripts/
    runMalabarScrape.ts
    runGlobalIngest.ts
    runRecommendations.ts
  docs/
    HOSTINGER_DEPLOYMENT.md
  .env.example
```

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL
- NextAuth-ready architecture
- Chart.js-ready dependency

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Recommendation engine
The scoring engine lives at `src/lib/recommendation/engine.ts` and combines:
- Trend context (below 30d/90d average)
- Recent move (24h drop / spike)
- Premium over global spot estimate
- 90-day low condition

Admin-configurable defaults are in `src/lib/config/appConfig.ts` and can later be persisted into the `Setting` table.

## Scraper selector maintenance
Update selector/parsing behavior in:
- `src/lib/scraping/malabar.ts`

This file contains:
- selector config object
- parser version
- HTML fetch behavior
- dynamic karat parsing logic

## Ad code management
Ad architecture is componentized in:
- `src/components/ads/AdSlot.tsx`
- `src/lib/config/appConfig.ts`
- `AdSlot` database model in `prisma/schema.prisma`

Update placeholder/custom ad code in admin-managed `AdSlot.customCode` (future UI is scaffolded under `/admin/ads`).

## SEO templates and generated pages
- Dynamic templates:
  - `/gold/[country]`
  - `/history/[country]`
  - `/analysis/[country]`
  - `/best-time/[country]`
  - `/calculators/[slug]`
  - `/guides/[country]/[slug]`
  - `/faq/[slug]`
  - `/countries/[country]`
  - `/cities/[city]`
  - `/stores/[country]/[city]/[store]`
- Internal linking/template helpers live in `src/lib/seo/templates.ts`.
- Technical SEO routes:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`

## Hostinger deployment
See `docs/HOSTINGER_DEPLOYMENT.md` for full deployment + cron instructions.

## Product disclaimers
Financial recommendation output is informational only. Use the reusable disclaimer component:
- `src/components/shared/FinancialDisclaimer.tsx`

## Build-time environment behavior
`src/lib/config/env.ts` is designed to avoid hard-failing the Next.js build when optional runtime-only variables are missing. Variables required for specific runtime jobs (like scraping) are validated with `requireEnv(...)` at execution time.

For production deployment, you must still define all required variables from `.env.example`.

## Malabar source configuration
- Price scraping source: `MALABAR_URL` (gold rate page).
- Store-directory/reference source: `MALABAR_STORES_URL` (Qatar stores page).

## Database URL safety
If your MySQL password includes reserved URL characters (such as `@`), URL-encode them in `DATABASE_URL`.
Example: `Demmahom@98` -> `Demmahom%4098`.

## Implemented functionality upgrades
- **Global ingest with backup providers**: `src/lib/global/providers.ts` + `POST /api/ingest/global` now fetch XAU/USD and USD/QAR, compute QAR/gram, and persist when DB is configured.
- **Malabar ingest persistence**: `POST /api/ingest/malabar` now retries scraping, stores raw snapshots, writes dynamic karat snapshots, and records parser failures.
- **Recommendation persistence**: `POST /api/recommendations` now stores recommendation rows and reason records.
- **Internal analytics endpoint**: `POST /api/analytics` tracks events for page performance and conversion measurement.
- **Admin runtime configuration APIs**:
  - `GET/POST /api/admin/settings` for settings persistence via `Setting` table.
  - `GET/POST /api/admin/ad-slots` for ad slot persistence via `AdSlot` table.
- **Shareable branded chart image**: `GET /api/share/chart` now returns a TrackYourGold-branded SVG image suitable for social sharing.
- **Working calculator pages**: `/calculators/[slug]` includes interactive calculation logic for all required calculator slugs.
- **Portfolio tracker logic**: dashboard portfolio page now computes cost basis, holdings, and unrealized P/L interactively.


## Runtime requirements
- Node.js 20.x to 22.x (recommended: 20 LTS for Hostinger compatibility)
- npm (project packageManager set to `npm@10`)


## Why data now appears immediately
- Added a market data service with **database-or-demo fallback** (`src/lib/data/market.ts`).
- Public gold pages and dashboard now render actual latest prices, premium-over-spot, and recommendation output.
- If DB is empty or not configured, demo market data is shown so features are still usable.
- If DB is configured, run `npm run prisma:seed` to populate initial price/global reference rows.
- API endpoint for latest market payload: `GET /api/market/latest?countryCode=QA`.
