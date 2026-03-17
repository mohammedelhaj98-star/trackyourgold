import "server-only";

import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { env, hasDatabaseConfig, hasSessionConfig, isProduction } from "@/lib/env";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function authenticateUser(email: string, password: string) {
  if (!hasDatabaseConfig()) return null;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  if (!hasDatabaseConfig() || !hasSessionConfig()) {
    throw new Error("Session configuration is incomplete.");
  }

  const token = `${crypto.randomBytes(24).toString("hex")}.${Date.now()}`;
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(env.sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.sessionCookieName)?.value;

  if (token && hasDatabaseConfig()) {
    try {
      await db.session.delete({ where: { tokenHash: hashToken(token) } });
    } catch {
      // Ignore missing/expired sessions during logout.
    }
  }

  cookieStore.set(env.sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    expires: new Date(0)
  });
}

export async function getCurrentUser() {
  if (!hasDatabaseConfig()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(env.sessionCookieName)?.value;
  if (!token) return null;

  try {
    const session = await db.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true }
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
      try {
        await db.session.delete({ where: { id: session.id } });
      } catch {
        // Ignore cleanup failure here.
      }
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function requireAdmin(nextPath = "/admin") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

