import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { getRedirectRules } from "@/lib/cms";
import { splitBody, getPublishedContentPageBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

async function resolvePath(slugParts?: string[]) {
  return slugParts?.filter(Boolean).join("/") ?? "";
}

async function resolveRedirect(pathname: string) {
  const rules = await getRedirectRules();
  return rules.find((rule) => rule.fromPath.replace(/^\/+/, "") === pathname);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pathname = await resolvePath(resolvedParams.slug);

  if (!pathname) {
    return {};
  }

  const page = await getPublishedContentPageBySlug(pathname);
  if (!page) {
    return {};
  }

  return {
    title: page.seoMetadata?.title ?? page.title,
    description: page.seoMetadata?.description ?? page.summary ?? page.intro ?? undefined
  };
}

export default async function ContentPageRoute({ params }: PageProps) {
  const resolvedParams = await params;
  const pathname = await resolvePath(resolvedParams.slug);

  if (!pathname) {
    notFound();
  }

  const redirectRule = await resolveRedirect(pathname);
  if (redirectRule) {
    if (redirectRule.statusCode === 301) {
      permanentRedirect(redirectRule.toPath);
    }

    redirect(redirectRule.toPath);
  }

  const page = await getPublishedContentPageBySlug(pathname);
  if (!page) {
    notFound();
  }

  const bodyParts = splitBody(page.body);

  return (
    <div className="shell article">
      <section className="hero">
        <div className="stack">
          <p className="eyebrow">{page.type}</p>
          <h1>{page.title}</h1>
          <p>{page.summary ?? page.intro ?? "This page is being served by the reset CMS renderer."}</p>
        </div>
        <div className="article__meta">
          <span>Slug: /{page.slug}</span>
          <span>Status: {page.status}</span>
          {page.country ? <span>Country: {page.country.name}</span> : null}
          {page.city ? <span>City: {page.city.name}</span> : null}
          {page.store ? <span>Store: {page.store.name}</span> : null}
        </div>
      </section>

      <section className="article-panel stack">
        {page.intro ? <p className="muted">{page.intro}</p> : null}
        <div className="article__body">
          {bodyParts.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
