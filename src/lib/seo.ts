import type { Metadata } from "next";

import { siteConfig } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
  noIndex?: boolean;
};

export function buildMetadata({ title, description, path = "/", imagePath, noIndex }: MetadataInput): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const canonical = absoluteUrl(path);
  const image = imagePath ? absoluteUrl(imagePath) : absoluteUrl("/api/og/price?country=qatar&karat=22K");

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image]
    }
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item)
    }))
  };
}

export function buildPricePageSchema(input: {
  title: string;
  description: string;
  karat: string;
  country: string;
  valueQar: number;
  updatedAt: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    creator: {
      "@type": "Organization",
      name: siteConfig.name
    },
    temporalCoverage: input.updatedAt,
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: `${input.karat} gold price per gram in ${input.country}`,
        unitText: "QAR"
      }
    ],
    distribution: {
      "@type": "DataDownload",
      contentUrl: absoluteUrl(`/api/chart-data?country=${input.country}&karat=${input.karat}`),
      encodingFormat: "application/json"
    },
    measurementTechnique: `Scraped store pricing and spot-derived benchmark comparison. Current value ${input.valueQar} QAR.`
  };
}

export function buildCalculatorSchema(input: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: "FinanceApplication",
    operatingSystem: "All"
  };
}

export function buildArticleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name
    },
    mainEntityOfPage: absoluteUrl(input.path)
  };
}
