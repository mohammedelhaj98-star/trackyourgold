import { Prisma, PrismaClient, RecommendationLabel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TROY_OUNCE_GRAMS = 31.1034768;

function randomNoise(seed: number) {
  return Math.sin(seed * 12.9898) * 43758.5453 - Math.floor(Math.sin(seed * 12.9898) * 43758.5453);
}

function buildRecommendation(score: number): RecommendationLabel {
  if (score >= 75) return RecommendationLabel.STRONG_BUY;
  if (score >= 55) return RecommendationLabel.BUY;
  if (score >= 35) return RecommendationLabel.WAIT;
  return RecommendationLabel.AVOID;
}

async function main() {
  await prisma.adminAuditLog.deleteMany();
  await prisma.affiliateClick.deleteMany();
  await prisma.internalAnalytics.deleteMany();
  await prisma.alertEvent.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.recommendationReason.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.savedAnalysis.deleteMany();
  await prisma.globalGoldPrice.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.goldPriceSnapshot.deleteMany();
  await prisma.parserFailure.deleteMany();
  await prisma.rawScrapeSnapshot.deleteMany();
  await prisma.storeAffiliateLink.deleteMany();
  await prisma.seoMetadata.deleteMany();
  await prisma.blogArticle.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.contentPage.deleteMany();
  await prisma.adSlot.deleteMany();
  await prisma.emailSubscriber.deleteMany();
  await prisma.newsletterSignup.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

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
      externalUrl: "https://www.malabargoldanddiamonds.com/stores/qatar",
      description:
        "Primary tracked store source for Qatar. The parser dynamically detects all published karats on the Qatar page.",
      isPrimarySource: true,
      affiliateDisclosure:
        "TrackYourGold may earn from future affiliate partnerships when available."
    }
  });

  const affiliateLink = await prisma.storeAffiliateLink.create({
    data: {
      storeId: malabar.id,
      localeCode: "qa-en",
      label: "Visit store",
      url: "https://www.malabargoldanddiamonds.com/stores/qatar"
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

  const settings = [
    {
      key: "premium.enabled",
      groupName: "premium",
      value: JSON.stringify(false),
      valueType: "boolean",
      description: "Global premium launch toggle."
    },
    {
      key: "ads.enabled",
      groupName: "ads",
      value: JSON.stringify(true),
      valueType: "boolean",
      description: "Master ad monetization toggle."
    },
    {
      key: "scraper.schedule_minutes",
      groupName: "scraper",
      value: JSON.stringify(30),
      valueType: "number",
      description: "Malabar scraper run interval in minutes."
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
      description: "Default scoring weights used by the recommendation engine."
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
      description: "Recommendation label thresholds and event triggers."
    },
    {
      key: "seo.default_country",
      groupName: "seo",
      value: JSON.stringify("qatar"),
      valueType: "string",
      description: "Primary launch locale for generated pages."
    },
    {
      key: "alerts.weekly_summary_day",
      groupName: "alerts",
      value: JSON.stringify("MONDAY"),
      valueType: "string",
      description: "Preferred weekly summary day."
    }
  ];

  await prisma.setting.createMany({
    data: settings.map((item) => ({ ...item, updatedById: adminUser.id }))
  });

  await prisma.adSlot.createMany({
    data: [
      {
        key: "desktop-sidebar",
        name: "Desktop Sidebar",
        type: "DESKTOP_SIDEBAR",
        locationPath: "public-sidebar",
        placeholderMode: true,
        placeholderTitle: "Gold Buying Partners",
        placeholderDescription: "Reserved for AdSense or affiliate partner widgets."
      },
      {
        key: "footer-banner",
        name: "Footer Banner",
        type: "FOOTER_BANNER",
        locationPath: "site-footer",
        placeholderMode: true,
        placeholderTitle: "Track smarter gold decisions",
        placeholderDescription: "Launch-ready footer monetization slot."
      },
      {
        key: "dashboard-inline",
        name: "Dashboard Inline",
        type: "DASHBOARD_INLINE",
        locationPath: "dashboard-free-tier",
        placeholderMode: true,
        placeholderTitle: "Upgrade-ready placement",
        placeholderDescription: "Hidden for signed-in users by default, available for future segmentation."
      }
    ]
  });

  const now = new Date();
  const points = 360;
  const karats = [
    { label: "18K", purity: 75, base: 229 },
    { label: "22K", purity: 91.6, base: 281 },
    { label: "24K", purity: 99.9, base: 304 }
  ];

  const rawSnapshot = await prisma.rawScrapeSnapshot.create({
    data: {
      storeId: malabar.id,
      url: malabar.externalUrl!,
      html: "<html><body><table><tr><td>18K</td><td>QAR 238.10</td></tr><tr><td>22K</td><td>QAR 288.40</td></tr><tr><td>24K</td><td>QAR 312.50</td></tr></table></body></html>",
      status: "SUCCESS",
      parserVersion: process.env.MALABAR_PARSER_VERSION ?? "2026-03-16",
      sourceTimestamp: now,
      scrapeTimestamp: now,
      detectedKarats: ["18K", "22K", "24K"],
      notes: "Seed snapshot representing a valid scraper result."
    }
  });

  const exchangeRateRows: Prisma.ExchangeRateCreateManyInput[] = [];
  const globalRows: Prisma.GlobalGoldPriceCreateManyInput[] = [];
  const snapshotRows: Prisma.GoldPriceSnapshotCreateManyInput[] = [];

  for (let i = points; i >= 0; i -= 1) {
    const capturedAt = new Date(now.getTime() - i * 12 * 60 * 60 * 1000);
    const phase = (points - i) / 18;
    const noise = randomNoise(i + 1) - 0.5;
    const usdQar = 3.64 + Math.sin(phase / 7) * 0.015 + noise * 0.004;
    const xauUsd = 2140 + Math.sin(phase / 5) * 42 + Math.cos(phase / 11) * 26 + noise * 18;
    const qarPerGramEstimate = (xauUsd / TROY_OUNCE_GRAMS) * usdQar;

    exchangeRateRows.push({
      countryId: qatar.id,
      provider: "open-er-api",
      baseCurrency: "USD",
      quoteCurrency: "QAR",
      rate: new Prisma.Decimal(usdQar.toFixed(8)),
      capturedAt,
      status: "SUCCESS",
      metadataJson: { source: "seed" }
    });

    globalRows.push({
      countryId: qatar.id,
      provider: "alpha-vantage",
      symbol: "XAU/USD",
      priceUsdPerTroyOunce: new Prisma.Decimal(xauUsd.toFixed(4)),
      qarPerGramEstimate: new Prisma.Decimal(qarPerGramEstimate.toFixed(4)),
      capturedAt,
      status: "SUCCESS",
      metadataJson: { source: "seed" }
    });

    for (const karat of karats) {
      const regionalPremium = karat.label === "24K" ? 6.2 : karat.label === "22K" ? 4.1 : 3.1;
      const drift = Math.sin(phase / 3 + karat.purity / 30) * 6 + Math.cos(phase / 13) * 3;
      const price = karat.base + drift + noise * 5 + regionalPremium;
      snapshotRows.push({
        countryId: qatar.id,
        storeId: malabar.id,
        rawSnapshotId: i === 0 ? rawSnapshot.id : null,
        sourceKind: "STORE",
        karatLabel: karat.label,
        purityPct: karat.purity,
        metricUnit: "gram",
        currencyCode: "QAR",
        pricePerGram: new Prisma.Decimal(price.toFixed(4)),
        sourceTimestamp: capturedAt,
        scrapeTimestamp: capturedAt,
        capturedAt,
        parserVersion: process.env.MALABAR_PARSER_VERSION ?? "2026-03-16",
        scrapeStatus: "SUCCESS",
        isStale: false,
        metadataJson: { origin: "seed" }
      });
    }
  }

  await prisma.exchangeRate.createMany({ data: exchangeRateRows });
  await prisma.globalGoldPrice.createMany({ data: globalRows });
  await prisma.goldPriceSnapshot.createMany({ data: snapshotRows });

  const latestSnapshots = await prisma.goldPriceSnapshot.findMany({
    where: { countryId: qatar.id, karatLabel: { in: karats.map((item) => item.label) } },
    orderBy: { capturedAt: "desc" },
    take: 12
  });

  const latestGlobal = await prisma.globalGoldPrice.findFirst({
    where: { countryId: qatar.id },
    orderBy: { capturedAt: "desc" }
  });

  for (const karat of karats) {
    const current = latestSnapshots.find((item) => item.karatLabel === karat.label);
    if (!current || !latestGlobal) continue;

    const premiumVsSpot =
      ((Number(current.pricePerGram) - Number(latestGlobal.qarPerGramEstimate)) /
        Number(latestGlobal.qarPerGramEstimate)) *
      100;
    const score = Math.max(20, Math.min(88, Math.round(74 - premiumVsSpot * 2.1 + (karat.purity > 90 ? 6 : 0))));

    const recommendation = await prisma.recommendation.create({
      data: {
        countryId: qatar.id,
        snapshotId: current.id,
        karatLabel: karat.label,
        label: buildRecommendation(score),
        score,
        confidenceBand: score > 70 ? "High" : score > 50 ? "Medium" : "Cautious",
        explanation:
          premiumVsSpot < 5
            ? `${karat.label} is trading close to the spot-derived estimate, which improves entry quality for Qatar buyers.`
            : `${karat.label} carries a wider-than-ideal store premium versus the spot-derived estimate, so patience may be warranted.`,
        summaryText: `Seeded summary for ${karat.label}. Premium versus spot is ${premiumVsSpot.toFixed(2)}%.`,
        modelVersion: "seed-v1",
        premiumVsSpot: new Prisma.Decimal(premiumVsSpot.toFixed(4)),
        change24h: new Prisma.Decimal((-0.45 + karat.purity / 100).toFixed(4)),
        change7d: new Prisma.Decimal((1.8 - premiumVsSpot / 10).toFixed(4)),
        priceVs30d: new Prisma.Decimal((-2.3 + karat.purity / 30).toFixed(4)),
        priceVs90d: new Prisma.Decimal((-4.8 + karat.purity / 35).toFixed(4))
      }
    });

    await prisma.recommendationReason.createMany({
      data: [
        {
          recommendationId: recommendation.id,
          code: "below_30d_average",
          weight: 18,
          value: 1,
          direction: "positive",
          reason: `${karat.label} is priced below its rolling 30-day average.`
        },
        {
          recommendationId: recommendation.id,
          code: "premium_vs_spot",
          weight: 10,
          value: premiumVsSpot,
          direction: premiumVsSpot < 5 ? "positive" : "negative",
          reason:
            premiumVsSpot < 5
              ? "Store premium versus spot is inside the preferred entry band."
              : "Store premium versus spot is wider than the preferred entry band."
        },
        {
          recommendationId: recommendation.id,
          code: "recent_momentum",
          weight: 8,
          value: -0.35,
          direction: "positive",
          reason: "Short-term momentum is neutral-to-soft rather than spike-driven."
        }
      ]
    });
  }

  const leadGuide = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: "LANDING",
      slug: "free-gold-price-drop-alerts-qatar",
      localeKey: "qa-en",
      title: "Get Free Gold Price Drop Alerts in Qatar",
      summary: "Capture price drop alerts, weekly summaries, and market timing signals for Qatar gold buyers.",
      intro: "Lead magnet landing page for alerts and account creation.",
      body:
        "TrackYourGold lets buyers in Qatar follow Malabar rates, compare them with spot-derived benchmarks, and receive email alerts when conditions improve.",
      status: "PUBLISHED",
      publishAt: now,
      heroMetricLabel: "Alert signups"
    }
  });

  const qatarGuide = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: "GUIDE",
      slug: "gold-buying-guide-qatar",
      localeKey: "qa-en",
      title: "Gold Buying Guide in Qatar",
      summary: "A practical guide to karats, making charges, timing, and comparing store premiums in Qatar.",
      intro: "Core SEO guide for Qatar buying-intent queries.",
      body:
        "Use this guide to compare karats, understand premium over spot, and decide when to wait versus buy based on tracked local rates.",
      status: "PUBLISHED",
      publishAt: now,
      heroMetricLabel: "Guide depth"
    }
  });

  const karatPage = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: "KARAT",
      slug: "22kt-gold-price-in-qatar-today",
      localeKey: "qa-en",
      title: "22KT Gold Price in Qatar Today",
      summary: "Daily 22K gold tracking page designed for search, repeat traffic, and alert conversion.",
      intro: "Auto-generated karat landing page pattern.",
      body:
        "This page combines current 22K pricing, recent trend context, FAQ content, and related tools so it can rank for high-intent gold price searches in Qatar.",
      status: "PUBLISHED",
      publishAt: now,
      heroMetricLabel: "22K live price"
    }
  });

  const marketPage = await prisma.contentPage.create({
    data: {
      countryId: qatar.id,
      type: "MARKET_ANALYSIS",
      slug: "best-time-to-buy-gold-in-qatar",
      localeKey: "qa-en",
      title: "Best Time to Buy Gold in Qatar",
      summary: "Data-driven timing page combining local store trends, spot comparisons, and buy/wait signals.",
      intro: "High-intent timing page for SEO and conversion.",
      body:
        "TrackYourGold scores local rates against trailing averages, spot-derived estimates, and spike detection so buyers can identify calmer entry windows.",
      status: "PUBLISHED",
      publishAt: now,
      heroMetricLabel: "Timing score"
    }
  });

  const article = await prisma.blogArticle.create({
    data: {
      authorId: adminUser.id,
      countryId: qatar.id,
      slug: "how-to-read-gold-premium-over-spot-in-qatar",
      title: "How to Read Gold Premium Over Spot in Qatar",
      excerpt:
        "A practical explainer on why local store pricing and spot-derived gold estimates diverge, and how buyers should interpret the gap.",
      body:
        "Premium over spot measures how far local store pricing sits above the estimated raw gold benchmark after currency conversion. In Qatar, buyers should watch whether the premium is compressing or expanding before making a purchase.",
      category: "Analysis",
      tagsJson: ["gold premium", "qatar gold", "buying guide"],
      status: "PUBLISHED",
      publishedAt: now,
      scheduledAt: now
    }
  });

  const faqRows = await prisma.faq.createMany({
    data: [
      {
        countryId: qatar.id,
        slug: "what-is-the-best-karat-to-buy-in-qatar",
        question: "What is the best karat to buy in Qatar?",
        answer:
          "It depends on whether you prioritize purity, resale profile, or jewellery durability. TrackYourGold lets you compare 18K, 22K, 24K and any other karats detected on the store source page.",
        category: "Buying",
        sortOrder: 1
      },
      {
        countryId: qatar.id,
        slug: "why-do-local-gold-rates-differ-from-spot-price",
        question: "Why do local Qatar gold rates differ from the spot price?",
        answer:
          "Local store pricing includes retail premium, logistics, margin, and sometimes product-specific costs. The platform estimates a spot-derived benchmark so you can judge how wide that premium is.",
        category: "Pricing",
        sortOrder: 2
      },
      {
        countryId: qatar.id,
        slug: "can-i-get-email-alerts-for-90-day-lows",
        question: "Can I get email alerts when a 90-day low happens?",
        answer:
          "Yes. Registered users can create dashboard and email alerts for price drops, new lows, and weekly summaries.",
        category: "Alerts",
        sortOrder: 3
      }
    ]
  });

  await prisma.seoMetadata.createMany({
    data: [
      {
        contentPageId: leadGuide.id,
        title: leadGuide.title,
        description: leadGuide.summary!,
        canonicalUrl: "https://trackyourgold.com/alerts",
        ogTitle: leadGuide.title,
        ogDescription: leadGuide.summary!,
        ogImageUrl: "https://trackyourgold.com/api/og/price?country=qatar&karat=22K",
        twitterTitle: leadGuide.title,
        twitterDescription: leadGuide.summary!,
        schemaType: "WebPage",
        schemaJson: { pageType: "LeadMagnet" }
      },
      {
        contentPageId: qatarGuide.id,
        title: qatarGuide.title,
        description: qatarGuide.summary!,
        canonicalUrl: "https://trackyourgold.com/guides/qatar/buying",
        ogTitle: qatarGuide.title,
        ogDescription: qatarGuide.summary!,
        ogImageUrl: "https://trackyourgold.com/api/og/price?country=qatar&karat=24K",
        twitterTitle: qatarGuide.title,
        twitterDescription: qatarGuide.summary!,
        schemaType: "Article",
        schemaJson: { pageType: "BuyingGuide" }
      },
      {
        contentPageId: karatPage.id,
        title: karatPage.title,
        description: karatPage.summary!,
        canonicalUrl: "https://trackyourgold.com/live/qatar/22K",
        ogTitle: karatPage.title,
        ogDescription: karatPage.summary!,
        ogImageUrl: "https://trackyourgold.com/api/og/price?country=qatar&karat=22K",
        twitterTitle: karatPage.title,
        twitterDescription: karatPage.summary!,
        schemaType: "FinancialProduct",
        schemaJson: { pageType: "PricePage" }
      },
      {
        contentPageId: marketPage.id,
        title: marketPage.title,
        description: marketPage.summary!,
        canonicalUrl: "https://trackyourgold.com/best-time-to-buy/qatar",
        ogTitle: marketPage.title,
        ogDescription: marketPage.summary!,
        ogImageUrl: "https://trackyourgold.com/api/og/price?country=qatar&karat=22K",
        twitterTitle: marketPage.title,
        twitterDescription: marketPage.summary!,
        schemaType: "WebPage",
        schemaJson: { pageType: "MarketAnalysis" }
      },
      {
        blogArticleId: article.id,
        title: article.title,
        description: article.excerpt,
        canonicalUrl: "https://trackyourgold.com/gold-insights/how-to-read-gold-premium-over-spot-in-qatar",
        ogTitle: article.title,
        ogDescription: article.excerpt,
        ogImageUrl: "https://trackyourgold.com/api/og/price?country=qatar&karat=22K",
        twitterTitle: article.title,
        twitterDescription: article.excerpt,
        schemaType: "Article",
        schemaJson: { articleSection: article.category }
      }
    ]
  });

  await prisma.emailSubscriber.create({
    data: {
      email: "alerts@trackyourgold.com",
      sourcePage: "/alerts",
      countryId: qatar.id,
      tagsJson: ["lead-magnet", "seed"]
    }
  });

  await prisma.newsletterSignup.create({
    data: {
      email: "newsletter@trackyourgold.com",
      sourcePage: "/",
      segment: "weekly-summary",
      countryId: qatar.id
    }
  });

  const rule = await prisma.alertRule.create({
    data: {
      userId: demoUser.id,
      countryId: qatar.id,
      karatLabel: "22K",
      type: "PRICE_DROP",
      percentThreshold: 1.5,
      comparisonDays: 1,
      emailEnabled: true,
      dashboardEnabled: true,
      summaryFrequency: "weekly",
      cooldownMinutes: 720,
      isActive: true,
      settingsJson: { compareWindowHours: 24 }
    }
  });

  await prisma.alertEvent.create({
    data: {
      userId: demoUser.id,
      ruleId: rule.id,
      countryId: qatar.id,
      karatLabel: "22K",
      type: "PRICE_DROP",
      title: "22K moved into a softer buying zone",
      body: "22K pricing in Qatar softened versus the prior 24-hour window and premium versus spot narrowed.",
      status: "sent",
      deliveredAt: now,
      dedupeKey: `seed-price-drop-${now.toISOString().slice(0, 10)}`
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
        grams: new Prisma.Decimal("18.5000"),
        pricePerGram: new Prisma.Decimal("279.4000"),
        totalPaid: new Prisma.Decimal("5168.9000"),
        makingCharge: new Prisma.Decimal("92.0000"),
        purchasedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        notes: "Seed portfolio entry for demo dashboard."
      },
      {
        userId: demoUser.id,
        countryId: qatar.id,
        storeName: "Family Jeweller",
        karatLabel: "24K",
        grams: new Prisma.Decimal("5.2000"),
        pricePerGram: new Prisma.Decimal("301.2000"),
        totalPaid: new Prisma.Decimal("1566.2400"),
        makingCharge: new Prisma.Decimal("0.0000"),
        purchasedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        notes: "Small bullion-style purchase."
      }
    ]
  });

  await prisma.savedAnalysis.create({
    data: {
      userId: demoUser.id,
      countryId: qatar.id,
      karatLabel: "22K",
      note: "Watching for premium compression below 5%."
    }
  });

  await prisma.internalAnalytics.createMany({
    data: [
      {
        path: "/",
        routeType: "homepage",
        eventType: "page_view",
        countryId: qatar.id,
        sourcePage: "/",
        userId: null,
        metadataJson: { device: "desktop", source: "seed" }
      },
      {
        path: "/alerts",
        routeType: "lead_magnet",
        eventType: "lead_signup",
        countryId: qatar.id,
        sourcePage: "/alerts",
        userId: null,
        metadataJson: { source: "seed" }
      },
      {
        path: "/live/qatar/22K",
        routeType: "price_page",
        eventType: "page_view",
        countryId: qatar.id,
        sourcePage: "/live/qatar/22K",
        userId: demoUser.id,
        metadataJson: { source: "seed" }
      }
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
      outboundUrl: affiliateLink.url,
      metadataJson: { source: "seed" }
    }
  });

  await prisma.systemLog.createMany({
    data: [
      {
        level: "INFO",
        category: "seed",
        message: "Initial TrackYourGold dataset created.",
        metadataJson: { country: qatar.slug }
      },
      {
        level: "INFO",
        category: "scraper",
        message: "Malabar source seeded with a healthy parser snapshot.",
        metadataJson: { parserVersion: process.env.MALABAR_PARSER_VERSION ?? "2026-03-16" }
      }
    ]
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: adminUser.id,
      action: "seed.initialized",
      entityType: "system",
      entityId: qatar.id,
      detailsJson: { store: malabar.slug }
    }
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
