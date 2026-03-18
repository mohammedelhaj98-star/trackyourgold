import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { FastifyReply, FastifyRequest } from "fastify";

import type { ApiConfig } from "../config.js";
import { ApiError } from "./errors.js";

const ACCESS_COOKIE = "tyg_access_token";
const REFRESH_COOKIE = "tyg_refresh_token";

type AccessPayload = {
  sub: string;
  email: string;
  language: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(config: ApiConfig, payload: AccessPayload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: `${config.ACCESS_TOKEN_TTL_MINUTES}m`
  });
}

export function signRefreshToken(config: ApiConfig, userId: string) {
  return jwt.sign({ sub: userId, kind: "refresh" }, config.JWT_REFRESH_SECRET, {
    expiresIn: `${config.REFRESH_TOKEN_TTL_DAYS}d`
  });
}

export function verifyAccessToken(config: ApiConfig, token: string) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(config: ApiConfig, token: string) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as { sub: string; kind: string };
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function setSessionCookies(reply: FastifyReply, config: ApiConfig, accessToken: string, refreshToken: string) {
  const secure = config.APP_ENV === "production";
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    domain: config.COOKIE_DOMAIN
  };

  reply.setCookie(ACCESS_COOKIE, accessToken, {
    ...common,
    maxAge: config.ACCESS_TOKEN_TTL_MINUTES * 60
  });

  reply.setCookie(REFRESH_COOKIE, refreshToken, {
    ...common,
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60
  });
}

export function clearSessionCookies(reply: FastifyReply, config: ApiConfig) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    reply.clearCookie(name, {
      path: "/",
      domain: config.COOKIE_DOMAIN,
      sameSite: "lax",
      secure: config.APP_ENV === "production"
    });
  }
}

export function readTokens(request: FastifyRequest) {
  return {
    accessToken: request.cookies[ACCESS_COOKIE],
    refreshToken: request.cookies[REFRESH_COOKIE]
  };
}

export function requireAccessToken(request: FastifyRequest, config: ApiConfig) {
  const accessToken = request.cookies[ACCESS_COOKIE];
  if (!accessToken) {
    throw new ApiError(401, "unauthorized", "Authentication required.");
  }

  return verifyAccessToken(config, accessToken);
}
