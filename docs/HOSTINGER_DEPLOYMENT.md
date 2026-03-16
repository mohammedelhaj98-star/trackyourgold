# Hostinger deployment guide (Node.js Web App)

1. Create a Hostinger MySQL database and user.
2. Set environment variables from `.env.example`.
3. In Hostinger Node.js app settings, use Node 20+, start command `npm run start`.
4. Upload repository (or pull from GitHub), then run:
   - `npm ci`
   - `npx prisma generate`
   - `npx prisma migrate deploy`
   - `npm run build`
5. Configure domain `trackyourgold.com` to this app.

## Cron jobs (Hostinger)
Set three cron jobs:
- `*/30 * * * * cd ~/domains/trackyourgold.com/public_html && npm run scrape:malabar`
- `*/30 * * * * cd ~/domains/trackyourgold.com/public_html && npm run ingest:global`
- `5 * * * * cd ~/domains/trackyourgold.com/public_html && npm run recommendations:run`

For reliability, redirect logs to files and monitor parser failures in admin logs.
