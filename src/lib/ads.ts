import type { PlanTier, User } from "@prisma/client";

import { env } from "@/lib/env";

export function shouldShowAds(user?: Pick<User, "id" | "plan" | "adsSuppressed"> | null) {
  if (!env.ADS_ENABLED) return false;
  if (!user) return true;
  if (user.plan === "PREMIUM") return false;
  if (user.adsSuppressed && env.ALLOW_USER_AD_SUPPRESSION) return false;
  return false;
}

export function isPremiumActive(plan?: PlanTier | null) {
  if (plan === "PREMIUM") return true;
  return env.PREMIUM_ENABLED;
}
