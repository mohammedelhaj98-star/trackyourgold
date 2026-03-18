# TrackYourGold Web Deploy Branch

This branch exists only to deploy the TrackYourGold web frontend on Hostinger as a plain Next.js application. The backend, ingestion worker, and database stay on Render. The frontend reads everything through `API_BASE_URL` and does not connect to the database directly.

## Required Environment Variables

```text
API_BASE_URL=https://trackyourgold.onrender.com
APP_DEFAULT_CURRENCY=QAR
APP_DEFAULT_LOCALE=en
WEB_APP_HOST=trackyourgold.com
COOKIE_DOMAIN=trackyourgold.com
```

## Hostinger Settings

Use the `Next.js` framework preset with:

```text
Root directory: ./
Build command: npm run build
Output directory: .next
Package manager: npm
Node version: 22.x
```

## Local Commands

```text
npm install
npm run build
npm run start
```
