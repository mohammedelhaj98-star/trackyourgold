# TrackYourGold Reset Baseline

TrackYourGold has been reset to a runtime-first baseline.

This version intentionally keeps:

- the existing MySQL/Prisma schema as the database foundation
- a minimal Hostinger-safe Next.js runtime
- a homepage-first public shell
- a minimal admin CMS for homepage content, navigation, pages, taxonomy, and settings

This version intentionally does **not** carry forward:

- the old SEO/public route tree
- the old admin surface
- the old pricing/scraper backend
- the old dashboard/private-product implementation

## Runtime gate routes

- `/`
- `/health`
- `/login`
- `/admin`

## Local setup

```bash
npm install
npm run build
npm start
```

Optional Prisma commands:

```bash
npm run db:generate
npm run db:push
```

