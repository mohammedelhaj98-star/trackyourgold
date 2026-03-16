"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

type LeadState = {
  ok: boolean;
  message: string;
};

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function subscribeLeadAction(_: LeadState, formData: FormData): Promise<LeadState> {
  const email = getValue(formData, "email").toLowerCase();
  const sourcePage = getValue(formData, "sourcePage") || "/";
  const countrySlug = getValue(formData, "countrySlug") || "qatar";

  const bucket = consumeRateLimit(`lead:${email}`, 6, 60 * 60 * 1000);
  if (!bucket.ok) {
    return { ok: false, message: "Too many signup attempts from this email. Please wait and try again." };
  }

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const country = await db.country.findUnique({ where: { slug: countrySlug } });

  await db.emailSubscriber.upsert({
    where: { email },
    create: {
      email,
      sourcePage,
      countryId: country?.id,
      tagsJson: ["price-drop-alerts"]
    },
    update: {
      sourcePage,
      countryId: country?.id,
      tagsJson: ["price-drop-alerts"]
    }
  });

  await db.newsletterSignup.upsert({
    where: {
      email_segment: {
        email,
        segment: "price-drop-alerts"
      }
    },
    create: {
      email,
      sourcePage,
      segment: "price-drop-alerts",
      countryId: country?.id
    },
    update: {
      sourcePage,
      countryId: country?.id
    }
  });

  await db.internalAnalytics.create({
    data: {
      path: sourcePage,
      routeType: "lead_magnet",
      eventType: "lead_signup",
      countryId: country?.id,
      sourcePage,
      metadataJson: { emailDomain: email.split("@")[1] }
    }
  });

  revalidatePath(sourcePage);
  return { ok: true, message: "You are subscribed for price drop alerts." };
}
