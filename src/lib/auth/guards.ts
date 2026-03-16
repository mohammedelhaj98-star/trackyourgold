import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireAdmin(nextPath = "/admin") {
  const user = await requireUser(nextPath);
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}
