export const siteConfig = {
  name: "TrackYourGold",
  domain: "trackyourgold.com",
  description:
    "Track Malabar Gold & Diamonds Qatar rates, compare them with global spot-derived prices, and get data-driven buy timing signals.",
  nav: [
    { label: "Platform", href: "/#platform" },
    { label: "Workflow", href: "/#workflow" },
    { label: "SEO Index", href: "/#seo-index" }
  ],
  seoNav: [
    { label: "Live Prices", href: "/live/qatar/22K" },
    { label: "History", href: "/history/qatar/22K" },
    { label: "Best Time to Buy", href: "/best-time-to-buy/qatar" },
    { label: "Calculators", href: "/calculators/qar-gold-calculator" },
    { label: "Gold Insights", href: "/gold-insights" },
    { label: "Alerts", href: "/alerts" }
  ],
  adminNav: [
    { label: "Overview", href: "/admin" },
    { label: "Scraper", href: "/admin/scraper" },
    { label: "Parser Health", href: "/admin/parser-health" },
    { label: "Ads", href: "/admin/ads" },
    { label: "SEO & Content", href: "/admin/seo" },
    { label: "Articles", href: "/admin/articles" },
    { label: "Users", href: "/admin/users" },
    { label: "Premium", href: "/admin/premium" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Logs", href: "/admin/logs" }
  ],
  dashboardNav: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Alerts", href: "/alerts/settings" },
    { label: "Saved Analysis", href: "/saved" }
  ]
};

export const publicPageTypes = [
  "live prices",
  "history pages",
  "buying guides",
  "best-time pages",
  "store comparisons",
  "blog articles",
  "FAQ pages",
  "karat explainers",
  "country and city hubs"
] as const;

export const recommendationLabels = {
  STRONG_BUY: { label: "Strong Buy", tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40" },
  BUY: { label: "Buy", tone: "bg-aqua-400/15 text-aqua-300 ring-aqua-400/40" },
  WAIT: { label: "Wait", tone: "bg-amber-500/15 text-amber-200 ring-amber-300/40" },
  AVOID: { label: "Avoid", tone: "bg-rose-500/15 text-rose-200 ring-rose-400/40" }
} as const;

export const adSlotKeys = {
  desktopSidebar: "desktop-sidebar",
  footerBanner: "footer-banner",
  dashboardInline: "dashboard-inline"
} as const;
