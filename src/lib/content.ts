import "server-only";

import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export function splitBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function getPublishedContentPageBySlug(slug: string) {
  if (!hasDatabaseConfig()) return null;

  try {
    return await db.contentPage.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED
      },
      include: {
        seoMetadata: true,
        country: true,
        city: true,
        store: true
      }
    });
  } catch {
    return null;
  }
}

