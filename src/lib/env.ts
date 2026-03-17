export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "tyg_session",
  sessionSecret: process.env.SESSION_SECRET ?? ""
};

export function hasDatabaseConfig() {
  return Boolean(env.databaseUrl);
}

export function hasSessionConfig() {
  return Boolean(env.sessionSecret);
}

export function isProduction() {
  return env.nodeEnv === "production";
}

