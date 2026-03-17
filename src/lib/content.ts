import "server-only";

import { unstable_cache } from "next/cache";
import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";

export function splitBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const getPublishedContentPageBySlugCached = unstable_cache(
  async (slug: string) => {
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
  },
  ["published-content-page-by-slug"],
  {
    revalidate: 300,
    tags: ["content-pages"]
  }
);

export async function getPublishedContentPageBySlug(slug: string) {
  return getPublishedContentPageBySlugCached(slug);
}
