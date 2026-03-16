"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createUserSession, destroyCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(formData: FormData) {
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const nextPath = getValue(formData, "next") || "/dashboard";

  const bucket = consumeRateLimit(`login:${email}`, 8, 15 * 60 * 1000);
  if (!bucket.ok) {
    redirect(`/login?error=Too many attempts&next=${encodeURIComponent(nextPath)}`);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect(`/login?error=Invalid credentials&next=${encodeURIComponent(nextPath)}`);
  }

  await createUserSession(user.id);
  revalidatePath("/");
  redirect(nextPath);
}

export async function registerAction(formData: FormData) {
  const name = getValue(formData, "name");
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const nextPath = getValue(formData, "next") || "/dashboard";

  if (!email || !password || password.length < 8) {
    redirect(`/register?error=Please use a valid email and a password with at least 8 characters&next=${encodeURIComponent(nextPath)}`);
  }

  const bucket = consumeRateLimit(`register:${email}`, 5, 30 * 60 * 1000);
  if (!bucket.ok) {
    redirect(`/register?error=Too many attempts. Please wait before trying again.&next=${encodeURIComponent(nextPath)}`);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/login?error=Account already exists&next=${encodeURIComponent(nextPath)}`);
  }

  const country = await db.country.findUnique({ where: { slug: "qatar" } });
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      countryId: country?.id,
      adsSuppressed: true,
      plan: "FREE"
    }
  });

  await db.internalAnalytics.create({
    data: {
      path: nextPath,
      routeType: "auth",
      eventType: "registration",
      countryId: country?.id,
      sourcePage: "/register",
      userId: user.id,
      metadataJson: { source: "server-action" }
    }
  });

  await createUserSession(user.id);
  revalidatePath("/");
  redirect(nextPath);
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/");
}
