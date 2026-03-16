import "server-only";

import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getPublishedArticle(slug: string) {
  return db.blogArticle.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED
    },
    include: {
      country: true,
      seoMetadata: true,
      author: true
    }
  });
}

export async function getContentPageBySlug(slug: string) {
  return db.contentPage.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED
    },
    include: {
      country: true,
      city: true,
      store: true,
      seoMetadata: true
    }
  });
}

export async function getFaqHubData() {
  return db.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    include: { country: true, seoMetadata: true }
  });
}
