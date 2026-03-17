# Hostinger Deployment

This reset baseline is designed to answer one question first:

Can Hostinger keep a very small Node/Next app alive reliably?

## Required environment variables

```env
NODE_ENV=production
APP_URL=https://trackyourgold.com
DATABASE_URL=mysql://username:password@localhost:3306/trackyourgold
SESSION_COOKIE_NAME=tyg_session
SESSION_SECRET=replace-with-a-long-random-secret
```

## Commands

```bash
npm install
npm run build
npm start
```

## Runtime gate

The deployment is considered healthy only if these routes all work after redeploy/restart:

- `/`
- `/health`
- `/login`

