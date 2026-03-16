# Prisma Migrations

This repository currently uses `prisma/schema.prisma` as the committed source of truth.

To generate the first SQL migration after installing dependencies, run:

```bash
npx prisma migrate dev --name init
```

For Hostinger deployment, `npm run db:push` is documented as the simplest first-time schema sync path when interactive migration generation is not convenient.
