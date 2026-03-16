import "server-only";

import { createHash, randomBytes } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

const SESSION_DURATION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(`${token}:${env.SESSION_SECRET}`).digest("hex");
}

async function getCookieStore() {
  return cookies();
}

export async function createUserSession(userId: string, meta?: { ipAddress?: string; userAgent?: string }) {
  const sessionToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent
    }
  });

  const cookieStore = await getCookieStore();
  cookieStore.set(env.SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });
}

export const getCurrentSession = cache(async () => {
  const cookieStore = await getCookieStore();
  const sessionToken = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  let session = null;

  try {
    session = await db.session.findUnique({
      where: { tokenHash: hashToken(sessionToken) },
      include: { user: true }
    });
  } catch (error) {
    console.error("[auth:getCurrentSession]", error);
    return null;
  }

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } }).catch(() => null);
    }
    cookieStore.delete(env.SESSION_COOKIE_NAME);
    return null;
  }

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
});

export async function destroyCurrentSession() {
  const cookieStore = await getCookieStore();
  const sessionToken = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashToken(sessionToken)
      }
    });
  }

  cookieStore.delete(env.SESSION_COOKIE_NAME);
}
