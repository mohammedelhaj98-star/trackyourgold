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
