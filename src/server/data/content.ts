import "server-only";

import { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function getPublishedArticle(slug: string) {
  try {
    return await db.blogArticle.findFirst({
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
  } catch (error) {
    console.error(`[content:article:${slug}]`, error);
    return null;
  }
}

export async function getContentPageBySlug(slug: string) {
  try {
    return await db.contentPage.findFirst({
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
  } catch (error) {
    console.error(`[content:page:${slug}]`, error);
    return null;
  }
}

export async function getFaqHubData() {
  try {
    return await db.faq.findMany({
      where: { isPublished: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      include: { country: true, seoMetadata: true }
    });
  } catch (error) {
    console.error("[content:faq-hub]", error);
    return [];
  }
}
