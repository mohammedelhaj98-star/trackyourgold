process.loadEnvFile?.();

import { ContentPageType, ContentStatus, PrismaClient, RecommendationLabel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TROY_OUNCE_GRAMS = 31.1034768;
const FX_RATE = 3.64;
const TOTAL_POINTS = 210;
const HOURS_PER_POINT = 12;

function asDecimal(value: number) {
  return value.toFixed(4);
}

function labelFromScore(score: number): RecommendationLabel {
  if (score >= 75) return RecommendationLabel.STRONG_BUY;
  if (score >= 55) return RecommendationLabel.BUY;
  if (score >= 35) return RecommendationLabel.WAIT;
  return RecommendationLabel.AVOID;
}

function buildSeriesPrice(base: number, index: number, softness = 0) {
  const wave = Math.sin(index / 9) * 4.4 + Math.cos(index / 17) * 2.1;
  const trend = (index - TOTAL_POINTS / 2) * 0.015;
  const pullback = index > TOTAL_POINTS - 18 ? -softness : 0;
  return Number((base + wave + trend + pullback).toFixed(4));
}

function scoreSnapshot(prices: number[], currentIndex: number, spotEstimate: number | null) {
  const current = prices[currentIndex];
  const trailing30 = prices.slice(Math.max(0, currentIndex - 59), currentIndex + 1);
  const trailing90 = prices.slice(Math.max(0, currentIndex - 179), currentIndex + 1);
  const avg30 = trailing30.reduce((sum, value) => sum + value, 0) / trailing30.length;
  const avg90 = trailing90.reduce((sum, value) => sum + value, 0) / trailing90.length;
  const prev24h = prices[Math.max(0, currentIndex - 2)];
  const low90 = Math.min(...trailing90);
  const premiumVsSpot = spotEstimate ? ((current - spotEstimate) / spotEstimate) * 100 : null;
  const change24h = ((current - prev24h) / prev24h) * 100;

  let score = 50;
  const reasons: Array<{ code: string; weight: number; value: number; direction: "positive" | "negative"; reason: string }> = [];

  if (current < avg30) {
    score += 18;
    reasons.push({
      code: "below_30d_average",
      weight: 18,
      value: Number((avg30 - current).toFixed(4)),
      direction: "positive",
      reason: "Price is trading below the trailing 30-day average."
    });
  }

  if (current < avg90) {
    score += 24;
    reasons.push({
      code: "below_90d_average",
      weight: 24,
      value: Number((avg90 - current).toFixed(4)),
      direction: "positive",
      reason: "Price is below the trailing 90-day average."
    });
  }

  if (change24h <= -0.75) {
    score += 14;
    reasons.push({
      code: "24h_drop",
      weight: 14,
      value: Number(change24h.toFixed(4)),
      direction: "positive",
      reason: "A meaningful 24-hour pullback improved entry quality."
    });
  }

  if (current <= low90 * 1.01) {
    score += 18;
    reasons.push({
      code: "near_90d_low",
      weight: 18,
      value: Number((current - low90).toFixed(4)),
      direction: "positive",
      reason: "Price is close to the 90-day low."
    });
  }

  if (change24h >= 1.25) {
    score -= 8;
    reasons.push({
      code: "sharp_spike",
      weight: 8,
      value: Number(change24h.toFixed(4)),
      direction: "negative",
      reason: "A recent spike weakens entry quality."
    });
  }

  if (premiumVsSpot !== null && premiumVsSpot >= 7) {
    score -= 10;
    reasons.push({
      code: "premium_vs_spot",
      weight: 10,
      value: Number(premiumVsSpot.toFixed(4)),
      direction: "negative",
      reason: "Premium versus spot-derived fair value is wider than preferred."
    });
  } else if (premiumVsSpot !== null) {
    reasons.push({
      code: "premium_vs_spot",
      weight: 10,
      value: Number(premiumVsSpot.toFixed(4)),
      direction: "positive",
      reason: "Premium versus spot-derived fair value remains contained."
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    label: labelFromScore(score),
    premiumVsSpot,
    change24h,
    avg30,
    avg90,
    reasons
  };
}

async function clearDatabase() {
  const deletions: Array<[string, () => Promise<unknown>]> = [
    ["adminAuditLog", () => prisma.adminAuditLog.deleteMany()],
    ["affiliateClick", () => prisma.affiliateClick.deleteMany()],
    ["internalAnalytics", () => prisma.internalAnalytics.deleteMany()],
    ["alertEvent", () => prisma.alertEvent.deleteMany()],
    ["alertRule", () => prisma.alertRule.deleteMany()],
    ["recommendationReason", () => prisma.recommendationReason.deleteMany()],
    ["recommendation", () => prisma.recommendation.deleteMany()],
    ["purchase", () => prisma.purchase.deleteMany()],
    ["savedAnalysis", () => prisma.savedAnalysis.deleteMany()],
    ["globalGoldPrice", () => prisma.globalGoldPrice.deleteMany()],
    ["exchangeRate", () => prisma.exchangeRate.deleteMany()],
    ["goldPriceSnapshot", () => prisma.goldPriceSnapshot.deleteMany()],
    ["parserFailure", () => prisma.parserFailure.deleteMany()],
    ["rawScrapeSnapshot", () => prisma.rawScrapeSnapshot.deleteMany()],
    ["storeAffiliateLink", () => prisma.storeAffiliateLink.deleteMany()],
    ["seoMetadata", () => prisma.seoMetadata.deleteMany()],
    ["blogArticle", () => prisma.blogArticle.deleteMany()],
    ["faq", () => prisma.faq.deleteMany()],
    ["contentPage", () => prisma.contentPage.deleteMany()],
    ["adSlot", () => prisma.adSlot.deleteMany()],
    ["emailSubscriber", () => prisma.emailSubscriber.deleteMany()],
    ["newsletterSignup", () => prisma.newsletterSignup.deleteMany()],
    ["setting", () => prisma.setting.deleteMany()],
    ["session", () => prisma.session.deleteMany()],
    ["user", () => prisma.user.deleteMany()],
    ["store", () => prisma.store.deleteMany()],
    ["city", () => prisma.city.deleteMany()],
    ["country", () => prisma.country.deleteMany()]
  ];

  for (const [, execute] of deletions) {
    await execute();
  }
}

async function main() {
  await clearDatabase();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@trackyourgold.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMeNow123!";

  const qatar = await prisma.country.create({
    data: {
      code: "QA",
      slug: "qatar",
      name: "Qatar",
      currencyCode: "QAR",
      timezone: "Asia/Qatar"
    }
  });

  const doha = await prisma.city.create({
    data: {
      countryId: qatar.id,
      slug: "doha",
      name: "Doha"
    }
  });

  const malabar = await prisma.store.create({
    data: {
      countryId: qatar.id,
      cityId: doha.id,
      slug: "malabar-gold-diamonds-qatar",
      name: "Malabar Gold & Diamonds Qatar",
      brand: "Malabar Gold & Diamonds",
      externalUrl: process.env.MALABAR_URL ?? "https://www.malabargoldanddiamonds.com/stores/qatar",
      description: "Primary tracked store source for Qatar with dynamic karat detection and archived scrape snapshots.",
      isPrimarySource: true,
      affiliateDisclosure: "TrackYourGold may earn from future affiliate partnerships when available."
    }
  });

  const affiliateLink = await prisma.storeAffiliateLink.create({
    data: {
      storeId: malabar.id,
      localeCode: "qa-en",
      label: "Visit Malabar Qatar",
      url: process.env.MALABAR_URL ?? "https://www.malabargoldanddiamonds.com/stores/qatar",
      network: "direct"
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "TrackYourGold Admin",
      role: "ADMIN",
      plan: "PREMIUM",
      countryId: qatar.id,
      adsSuppressed: true
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@trackyourgold.com",
      passwordHash: await bcrypt.hash("DemoUser123!", 12),
      name: "Demo User",
      role: "USER",
      plan: "FREE",
      countryId: qatar.id,
      adsSuppressed: true
    }
  });

  const points = Array.from({ length: TOTAL_POINTS }, (_, index) => {
    const capturedAt = new Date(Date.now() - (TOTAL_POINTS - index - 1) * HOURS_PER_POINT * 60 * 60 * 1000);
    const qarPerGramEstimate = buildSeriesPrice(286.5, index, 2.4);
    const priceUsdPerTroyOunce = (qarPerGramEstimate / FX_RATE) * TROY_OUNCE_GRAMS;
    return {
      capturedAt,
      qarPerGramEstimate,
      priceUsdPerTroyOunce
    };
  });

  const latestPoint = points.at(-1)!;

  const rawSnapshot = await prisma.rawScrapeSnapshot.create({
    data: {
      storeId: malabar.id,
      url: process.env.MALABAR_URL ?? "https://www.malabargoldanddiamonds.com/stores/qatar",
      html: "<html><body><div data-karat='18K'>18K</div><div data-karat='22K'>22K</div><div data-karat='24K'>24K</div></body></html>",
      status: "SUCCESS",
      parserVersion: "seed-v1",
      sourceTimestamp: latestPoint.capturedAt,
      scrapeTimestamp: new Date(latestPoint.capturedAt.getTime() + 5 * 60 * 1000),
      detectedKarats: ["18K", "22K", "24K"],
      notes: "Bootstrap scrape snapshot for parser-health and recovery views."
    }
  });

  await prisma.exchangeRate.createMany({
    data: points.map((point) => ({
      countryId: qatar.id,
      provider: "hostinger-seed",
      baseCurrency: "USD",
      quoteCurrency: "QAR",
      rate: asDecimal(FX_RATE),
      capturedAt: point.capturedAt,
      status: "SUCCESS"
    }))
  });

  await prisma.globalGoldPrice.createMany({
    data: points.map((point) => ({
      countryId: qatar.id,
      provider: "hostinger-seed",
      symbol: "XAU/USD",
      priceUsdPerTroyOunce: asDecimal(point.priceUsdPerTroyOunce),
      qarPerGramEstimate: asDecimal(point.qarPerGramEstimate),
      capturedAt: point.capturedAt,
      status: "SUCCESS"
    }))
  });

  const karatSeries = [
    { karatLabel: "18K", base: 236.5, softness: 1.4 },
    { karatLabel: "22K", base: 289.2, softness: 4.3 },
    { karatLabel: "24K", base: 315.4, softness: 3.2 }
  ];

  for (const series of karatSeries) {
    await prisma.goldPriceSnapshot.createMany({
      data: points.map((point, index) => ({
        countryId: qatar.id,
        storeId: malabar.id,
        rawSnapshotId: index === points.length - 1 ? rawSnapshot.id : null,
        sourceKind: "STORE",
        karatLabel: series.karatLabel,
        purityPct: series.karatLabel === "24K" ? 99.9 : series.karatLabel === "22K" ? 91.6 : 75,
        metricUnit: "gram",
        currencyCode: "QAR",
        pricePerGram: asDecimal(buildSeriesPrice(series.base, index, series.softness)),
        sourceTimestamp: point.capturedAt,
        scrapeTimestamp: new Date(point.capturedAt.getTime() + 5 * 60 * 1000),
        capturedAt: point.capturedAt,
        parserVersion: "seed-v1",
        scrapeStatus: "SUCCESS",
        isStale: false
      }))
    });
  }

  await prisma.parserFailure.create({
    data: {
      storeId: malabar.id,
      parserVersion: "seed-v0",
      message: "Historical parser failure example kept for admin health dashboards.",
      selectorKey: "price-grid",
      htmlSnapshotId: rawSnapshot.id,
      recoveredAt: new Date(latestPoint.capturedAt.getTime() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  const snapshots22k = await prisma.goldPriceSnapshot.findMany({
    where: { countryId: qatar.id, karatLabel: "22K", sourceKind: "STORE" },
    orderBy: { capturedAt: "asc" }
  });

  const snapshots24k = await prisma.goldPriceSnapshot.findMany({
    where: { countryId: qatar.id, karatLabel: "24K", sourceKind: "STORE" },
    orderBy: { capturedAt: "asc" }
  });

  const spotByTimestamp = new Map(points.map((point) => [point.capturedAt.toISOString(), point.qarPerGramEstimate]));

  for (const snapshots of [snapshots22k, snapshots24k]) {
    const priceSeries = snapshots.map((snapshot) => Number(snapshot.pricePerGram));
    for (let index = 24; index < snapshots.length; index += 14) {
      const snapshot = snapshots[index];
      const metrics = scoreSnapshot(priceSeries, index, spotByTimestamp.get(snapshot.capturedAt.toISOString()) ?? null);
      const recommendation = await prisma.recommendation.create({
        data: {
          countryId: qatar.id,
          snapshotId: snapshot.id,
          karatLabel: snapshot.karatLabel,
          label: metrics.label,
          score: metrics.score,
          confidenceBand: metrics.score >= 75 ? "High" : metrics.score >= 55 ? "Moderate" : metrics.score >= 35 ? "Balanced" : "Defensive",
          explanation:
            metrics.label === RecommendationLabel.STRONG_BUY
              ? `${snapshot.karatLabel} is screening attractively versus trailing averages and recent momentum.`
              : metrics.label === RecommendationLabel.BUY
                ? `${snapshot.karatLabel} looks reasonably priced for buyers who can tolerate normal market noise.`
                : metrics.label === RecommendationLabel.WAIT
                  ? `${snapshot.karatLabel} is not yet showing enough of a value edge to press aggressively.`
                  : `${snapshot.karatLabel} looks stretched relative to recent history, so patience remains sensible.`,
          summaryText: `${snapshot.karatLabel} scored ${metrics.score}/100 with 24-hour change ${metrics.change24h.toFixed(2)}%.`,
          modelVersion: "seed-weighted-v1",
          premiumVsSpot: metrics.premiumVsSpot !== null ? Number(metrics.premiumVsSpot.toFixed(4)) : null,
          change24h: Number(metrics.change24h.toFixed(4)),
          change7d: index >= 14 ? Number((((priceSeries[index] - priceSeries[index - 14]) / priceSeries[index - 14]) * 100).toFixed(4)) : 0,
          priceVs30d: Number((priceSeries[index] - metrics.avg30).toFixed(4)),
          priceVs90d: Number((priceSeries[index] - metrics.avg90).toFixed(4)),
          createdAt: snapshot.capturedAt
        }
      });

      if (metrics.reasons.length) {
        await prisma.recommendationReason.createMany({
          data: metrics.reasons.map((reason) => ({
            recommendationId: recommendation.id,
            code: reason.code,
            weight: reason.weight,
            value: reason.value,
            direction: reason.direction,
            reason: reason.reason,
            createdAt: snapshot.capturedAt
          }))
        });
      }
    }
  }

  await prisma.setting.createMany({
    data: [
      {
        key: "premium.enabled",
        groupName: "premium",
        value: "false",
        valueType: "boolean",
        description: "Global premium toggle. Architecture exists from day one even when disabled.",
        updatedById: adminUser.id
      },
      {
        key: "premium.checkout_enabled",
        groupName: "premium",
        value: "false",
        valueType: "boolean",
        description: "Checkout and paywall activation switch.",
        updatedById: adminUser.id
      },
      {
        key: "scraper.frequency_minutes",
        groupName: "scraper",
        value: "30",
        valueType: "number",
        description: "Hostinger cron frequency for Malabar scraping.",
        updatedById: adminUser.id
      },
      {
        key: "scraper.malabar_url",
        groupName: "scraper",
        value: process.env.MALABAR_URL ?? "https://www.malabargoldanddiamonds.com/stores/qatar",
        valueType: "string",
        description: "Primary source URL for Malabar Qatar.",
        updatedById: adminUser.id
      },
      {
        key: "recommendation.weights",
        groupName: "recommendation",
        value: JSON.stringify({
          below30d: 18,
          below90d: 24,
          drop24h: 14,
          low90d: 18,
          momentum: 8,
          volatilityPenalty: 8,
          premiumPenalty: 10
        }),
        valueType: "json",
        description: "Editable recommendation scoring weights.",
        updatedById: adminUser.id
      },
      {
        key: "recommendation.thresholds",
        groupName: "recommendation",
        value: JSON.stringify({
          strongBuy: 75,
          buy: 55,
          wait: 35,
          spikePenaltyPct: 1.25,
          premiumPenaltyPct: 7,
          drop24hPct: -0.75
        }),
        valueType: "json",
        description: "Editable recommendation thresholds.",
        updatedById: adminUser.id
      }
    ]
  });

  await prisma.adSlot.createMany({
    data: [
      {
        key: "desktop-sidebar",
        name: "Desktop Sidebar",
        type: "DESKTOP_SIDEBAR",
        locationPath: "/live/*",
        isEnabled: true,
        placeholderMode: true,
        provider: "placeholder",
        placeholderTitle: "Gold buyer partner slot",
        placeholderDescription: "Reusable ad component for desktop public pages."
      },
      {
        key: "footer-banner",
        name: "Footer Banner",
        type: "FOOTER_BANNER",
        locationPath: "/*",
        isEnabled: true,
        placeholderMode: true,
        provider: "placeholder",
        placeholderTitle: "Footer monetization slot",
        placeholderDescription: "Footer banner reserved for AdSense or custom network code."
      },
      {
        key: "dashboard-inline",
        name: "Dashboard Inline",
        type: "DASHBOARD_INLINE",
        locationPath: "/dashboard",
        isEnabled: true,
        placeholderMode: true,
        provider: "placeholder",
        placeholderTitle: "Free-user dashboard slot",
        placeholderDescription: "Dashboard ad area that can be suppressed when users are logged in or premium."
      }
    ]
  });

  const guidePage = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      cityId: doha.id,
      type: ContentPageType.GUIDE,
      slug: "gold-buying-guide-qatar",
      localeKey: "qa-en",
      title: "Gold buying guide in Qatar",
      summary: "A long-form evergreen guide covering karats, store premiums, making charges, alerts, and timing considerations.",
      intro: "Built for SEO traffic and conversion into free alerts, calculators, and registered accounts.",
      body:
        "TrackYourGold separates raw gold price, making charges, store premium, and timing risk so buyers can make cleaner decisions. In Qatar, 22K and 24K usually dominate intent, but price context, jewellery design premium, and resale expectations still matter. This page is intentionally structured as a scalable SEO template that can later be localized for more countries, cities, and stores.",
      status: ContentStatus.PUBLISHED,
      publishAt: new Date(),
      heroMetricLabel: "Guide"
    }
  });

  const analysisPage = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: ContentPageType.MARKET_ANALYSIS,
      slug: "qatar-market-analysis",
      localeKey: "qa-en",
      title: "Qatar gold market analysis",
      summary: "Public market analysis page combining local store data, recommendation logic, and premium-versus-spot context.",
      intro: "This page supports both repeat readership and future premium analysis upsells.",
      body:
        "The launch market focuses on Malabar Gold & Diamonds Qatar, but the data model already supports additional stores, cities, and countries. Recommendation labels are informational, grounded in historical store pricing, recent moves, and premium versus a global benchmark rather than guarantees.",
      status: ContentStatus.PUBLISHED,
      publishAt: new Date(),
      heroMetricLabel: "Analysis"
    }
  });

  const karatPage = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: ContentPageType.KARAT,
      slug: "qatar-22k-karat-guide",
      localeKey: "qa-en",
      title: "What 22K gold means in Qatar",
      summary: "Karat explanation page for buyers comparing purity, durability, and resale expectations.",
      intro: "This template is designed for future multi-country karat SEO expansion.",
      body:
        "22K gold is a common choice for buyers who want high purity without moving all the way to 24K. In Qatar, 22K often sits at the center of gift, wedding, and long-hold shopping intent, so a dedicated public page supports both SEO and trust-building.",
      status: ContentStatus.PUBLISHED,
      publishAt: new Date(),
      heroMetricLabel: "Karat"
    }
  });

  const article = await prisma.blogArticle.create({
    data: {
      authorId: adminUser.id,
      countryId: qatar.id,
      slug: "malabar-qatar-gold-price-premium-watch",
      title: "Malabar Qatar gold price premium watch",
      excerpt: "A sample launch article explaining how TrackYourGold compares local store prices with spot-derived fair value.",
      body:
        "TrackYourGold is designed as an SEO-first public product rather than a private dashboard alone. Public visitors can read daily pricing pages, historical trend pages, and buying guides, while registered users unlock alerts, saved analysis, and portfolio tools. This article gives the content hub a real launch asset and demonstrates the editorial system inside the admin panel.",
      category: "Market Analysis",
      tagsJson: ["qatar", "malabar", "gold prices"],
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date()
    }
  });

  const faq = await prisma.faq.create({
    data: {
      countryId: qatar.id,
      slug: "qatar-gold-price-faq",
      question: "How often does TrackYourGold update Qatar gold prices?",
      answer:
        "TrackYourGold is configured for 30-minute scraping and stores historical snapshots so buyers can compare current pricing with recent averages and global benchmarks.",
      category: "Pricing",
      sortOrder: 1,
      isPublished: true
    }
  });

  await prisma.seoMetadata.createMany({
    data: [
      {
        contentPageId: guidePage.id,
        title: "Gold buying guide in Qatar",
        description: "Learn how to compare Qatar gold rates, making charges, and store premium versus spot-derived benchmarks.",
        canonicalUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/guides/qatar/buying`,
        ogTitle: "Gold buying guide in Qatar",
        ogDescription: "A TrackYourGold launch guide for price-aware buyers in Qatar.",
        ogImageUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/api/og/price?country=qatar&karat=22K`,
        twitterTitle: "Gold buying guide in Qatar",
        twitterDescription: "Compare local rates, store premium, and timing context with TrackYourGold.",
        schemaType: "Article",
        robots: "index,follow"
      },
      {
        contentPageId: analysisPage.id,
        title: "Qatar gold market analysis",
        description: "Monitor Qatar gold rates, local premium versus spot, and recommendation context in one public page.",
        canonicalUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/analysis/qatar`,
        ogTitle: "Qatar gold market analysis",
        ogDescription: "Public market analysis page for TrackYourGold launch.",
        ogImageUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/api/og/price?country=qatar&karat=24K`,
        twitterTitle: "Qatar gold market analysis",
        twitterDescription: "Premium-versus-spot and buy-timing context for Qatar buyers.",
        schemaType: "WebPage",
        robots: "index,follow"
      },
      {
        contentPageId: karatPage.id,
        title: "What 22K gold means in Qatar",
        description: "Understand 22K purity, jewellery tradeoffs, and how TrackYourGold interprets Qatar pricing.",
        canonicalUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/karats/qatar/22K`,
        ogTitle: "What 22K gold means in Qatar",
        ogDescription: "Karat education page built for TrackYourGold SEO expansion.",
        ogImageUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/api/og/price?country=qatar&karat=22K`,
        twitterTitle: "What 22K gold means in Qatar",
        twitterDescription: "TrackYourGold karat explainer for Qatar buyers.",
        schemaType: "WebPage",
        robots: "index,follow"
      },
      {
        blogArticleId: article.id,
        title: "Malabar Qatar gold price premium watch",
        description: "How TrackYourGold compares Malabar Qatar pricing with spot-derived fair value.",
        canonicalUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/gold-insights/${article.slug}`,
        ogTitle: "Malabar Qatar gold price premium watch",
        ogDescription: "A launch content-hub article from TrackYourGold.",
        ogImageUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/api/og/price?country=qatar&karat=22K`,
        twitterTitle: "Malabar Qatar gold price premium watch",
        twitterDescription: "TrackYourGold article on premium versus spot.",
        schemaType: "Article",
        robots: "index,follow"
      },
      {
        faqId: faq.id,
        title: "Qatar gold price FAQ",
        description: "Frequently asked questions about TrackYourGold pricing updates, alerts, and analysis.",
        canonicalUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/faq`,
        ogTitle: "Qatar gold price FAQ",
        ogDescription: "FAQ hub entry for TrackYourGold launch.",
        ogImageUrl: `${process.env.APP_URL ?? "https://trackyourgold.com"}/api/og/price?country=qatar&karat=22K`,
        twitterTitle: "Qatar gold price FAQ",
        twitterDescription: "Questions and answers about TrackYourGold data and alerts.",
        schemaType: "FAQPage",
        robots: "index,follow"
      }
    ]
  });

  await prisma.emailSubscriber.create({
    data: {
      email: "alerts@trackyourgold.com",
      sourcePage: "/alerts",
      countryId: qatar.id,
      confirmedAt: new Date(),
      userId: demoUser.id,
      tagsJson: ["price-drop-alerts", "launch"]
    }
  });

  await prisma.newsletterSignup.create({
    data: {
      email: "alerts@trackyourgold.com",
      sourcePage: "/alerts",
      segment: "price-drop-alerts",
      countryId: qatar.id
    }
  });

  await prisma.purchase.createMany({
    data: [
      {
        userId: demoUser.id,
        countryId: qatar.id,
        storeId: malabar.id,
        storeName: malabar.name,
        karatLabel: "22K",
        grams: "18.5000",
        pricePerGram: "284.9000",
        totalPaid: "5360.6500",
        makingCharge: "90.0000",
        purchasedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        notes: "Launch demo purchase."
      },
      {
        userId: demoUser.id,
        countryId: qatar.id,
        storeId: malabar.id,
        storeName: malabar.name,
        karatLabel: "24K",
        grams: "10.0000",
        pricePerGram: "309.5000",
        totalPaid: "3095.0000",
        makingCharge: "0.0000",
        purchasedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        notes: "Bullion-style demo entry."
      }
    ]
  });

  await prisma.savedAnalysis.create({
    data: {
      userId: demoUser.id,
      countryId: qatar.id,
      karatLabel: "22K",
      note: "Watching for further premium compression before adding."
    }
  });

  await prisma.alertRule.createMany({
    data: [
      {
        userId: demoUser.id,
        countryId: qatar.id,
        karatLabel: "22K",
        type: "PRICE_DROP",
        percentThreshold: 1.2,
        comparisonDays: 1,
        emailEnabled: true,
        dashboardEnabled: true,
        summaryFrequency: "instant",
        cooldownMinutes: 720,
        isActive: true
      },
      {
        userId: demoUser.id,
        countryId: qatar.id,
        karatLabel: "24K",
        type: "WEEKLY_SUMMARY",
        emailEnabled: true,
        dashboardEnabled: true,
        summaryFrequency: "weekly",
        cooldownMinutes: 10080,
        isActive: true
      }
    ]
  });

  await prisma.alertEvent.create({
    data: {
      userId: demoUser.id,
      countryId: qatar.id,
      karatLabel: "22K",
      type: "PRICE_DROP",
      title: "22K price drop alert",
      body: "22K pricing softened versus the recent range, improving entry conditions.",
      status: "ready",
      dedupeKey: "seed-22k-price-drop",
      deliveredAt: new Date()
    }
  });

  await prisma.internalAnalytics.createMany({
    data: [
      { path: "/", routeType: "homepage", eventType: "page_view", countryId: qatar.id, sourcePage: "/" },
      { path: "/live/qatar/22K", routeType: "live_price_page", eventType: "page_view", countryId: qatar.id, sourcePage: "/live/qatar/22K" },
      { path: "/history/qatar/22K", routeType: "history_page", eventType: "page_view", countryId: qatar.id, sourcePage: "/history/qatar/22K" },
      { path: "/alerts", routeType: "lead_magnet", eventType: "lead_signup", countryId: qatar.id, sourcePage: "/alerts", userId: demoUser.id },
      { path: "/register", routeType: "register_page", eventType: "registration", countryId: qatar.id, sourcePage: "/register", userId: demoUser.id }
    ]
  });

  await prisma.affiliateClick.create({
    data: {
      affiliateLinkId: affiliateLink.id,
      storeId: malabar.id,
      pagePath: "/stores/qatar/doha/malabar-gold-diamonds-qatar",
      localeCode: "qa-en",
      userId: demoUser.id,
      countryId: qatar.id,
      outboundUrl: affiliateLink.url
    }
  });

  await prisma.systemLog.createMany({
    data: [
      {
        level: "INFO",
        category: "seed",
        message: "Bootstrap dataset created for TrackYourGold."
      },
      {
        level: "INFO",
        category: "scraper",
        message: "Malabar Qatar source seeded with dynamic karats and parser snapshot."
      }
    ]
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      action: "seed.initialized",
      entityType: "system",
      entityId: qatar.id,
      detailsJson: { store: malabar.slug, country: qatar.slug }
    }
  });

  console.log(`Seed complete. Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Demo login: demo@trackyourgold.com / DemoUser123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
