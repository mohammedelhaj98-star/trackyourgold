export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

type MessageCatalog = {
  brandTagline: string;
  navDashboard: string;
  navVaults: string;
  navSources: string;
  navLogin: string;
  navSignup: string;
  localeSwitch: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroSecondaryCta: string;
  heroBoardLabel: string;
  heroBoardFresh: string;
  heroBoardStale: string;
  heroPulseTitle: string;
  heroPulseCopy: string;
  live24k: string;
  retail22k: string;
  retailSpread: string;
  pending: string;
  freshSignal: string;
  staleSignal: string;
  featureVaultTitle: string;
  featureVaultCopy: string;
  featureClarityTitle: string;
  featureClarityCopy: string;
  featureTrustTitle: string;
  featureTrustCopy: string;
  dashboardTitle: string;
  dashboardIntro: string;
  totalValue: string;
  invested: string;
  profitLoss: string;
  lastUpdated: string;
  addItem: string;
  manageVaults: string;
  trackedPieces: string;
  emptyItems: string;
  vaultsTitle: string;
  vaultsIntro: string;
  newVault: string;
  vaultName: string;
  createVault: string;
  loginEyebrow: string;
  loginTitle: string;
  loginIntro: string;
  signupEyebrow: string;
  signupTitle: string;
  signupIntro: string;
  email: string;
  password: string;
  sourcesTitle: string;
  sourcesIntro: string;
  healthy: string;
  stale: string;
  failures: string;
  addItemTitle: string;
  addItemIntro: string;
  category: string;
  karat: string;
  grossWeight: string;
  stoneWeight: string;
  purchaseDate: string;
  purchaseTotal: string;
  makingCharges: string;
  vat: string;
  store: string;
  location: string;
  notes: string;
  saveItem: string;
  itemDetail: string;
  itemDetailIntro: string;
  saveChanges: string;
  deleteItem: string;
  snapshot: string;
  purchaseContext: string;
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === "en" ? "ar" : "en";
}

export const messages: Record<Locale, MessageCatalog> = {
  en: {
    brandTagline: "Qatar live gold tracker",
    navDashboard: "Dashboard",
    navVaults: "Vaults",
    navSources: "Sources",
    navLogin: "Login",
    navSignup: "Create account",
    localeSwitch: "العربية",
    heroEyebrow: "Qatar 22K live rate",
    heroTitle: "Track what your gold is worth today - piece by piece.",
    heroSubtitle: "A polished vault for your jewelry, coins, and bars. Live QAR estimates from market rates and local retail boards.",
    heroCta: "Create account",
    heroSecondaryCta: "Open dashboard",
    heroBoardLabel: "Per gram · default market Qatar",
    heroBoardFresh: "Fresh market signal from the latest published quote.",
    heroBoardStale: "Using the latest available market snapshot.",
    heroPulseTitle: "Market pulse",
    heroPulseCopy: "A clean read on the live board, retail board, and 7-day movement without finance noise.",
    live24k: "24K live",
    retail22k: "Retail 22K",
    retailSpread: "Retail spread",
    pending: "Pending",
    freshSignal: "Fresh",
    staleSignal: "Latest snapshot",
    featureVaultTitle: "Track every piece you own.",
    featureVaultCopy: "Jewelry, coins, bars, and scrap all live inside one calm, personal vault.",
    featureClarityTitle: "See value and profit in seconds.",
    featureClarityCopy: "Intrinsic, retail, and sell estimates stay readable and consistent in QAR.",
    featureTrustTitle: "Built on compliant live inputs.",
    featureTrustCopy: "Retail scraping is robots-gated and every source snapshot is recorded before parsing.",
    dashboardTitle: "Your Gold Today",
    dashboardIntro: "A focused read on your latest vault value, cost basis, and piece-level movement.",
    totalValue: "Total value",
    invested: "Invested",
    profitLoss: "Profit/Loss",
    lastUpdated: "Last updated",
    addItem: "Add item",
    manageVaults: "Manage vaults",
    trackedPieces: "Tracked pieces",
    emptyItems: "Add your first piece to start tracking daily value.",
    vaultsTitle: "Your vaults",
    vaultsIntro: "Separate collections for jewelry, coins, bars, or anything you want to track cleanly.",
    newVault: "New vault",
    vaultName: "Vault name",
    createVault: "Create vault",
    loginEyebrow: "Admin access",
    loginTitle: "Open your vault",
    loginIntro: "Sign in to see your latest valuation, recent pieces, and source-backed pricing.",
    signupEyebrow: "Create account",
    signupTitle: "Start your gold vault",
    signupIntro: "Build a clean record of what you bought, what it weighs, and what it is worth today.",
    email: "Email",
    password: "Password",
    sourcesTitle: "Source health",
    sourcesIntro: "Watch the market and retail feeds, their freshness, and any failures that need attention.",
    healthy: "Healthy",
    stale: "Stale",
    failures: "Failures",
    addItemTitle: "Add item",
    addItemIntro: "Capture the essentials once, then let the platform keep valuing the piece for you.",
    category: "Category",
    karat: "Karat",
    grossWeight: "Gross weight (g)",
    stoneWeight: "Stone weight (g)",
    purchaseDate: "Purchase date",
    purchaseTotal: "Purchase total (QAR)",
    makingCharges: "Making charges",
    vat: "VAT",
    store: "Store",
    location: "Location",
    notes: "Notes",
    saveItem: "Save item",
    itemDetail: "Item detail",
    itemDetailIntro: "Estimates vary by buyer, premium, and deductions. Keep the purchase details tidy here.",
    saveChanges: "Save changes",
    deleteItem: "Delete item",
    snapshot: "Snapshot",
    purchaseContext: "Purchase context"
  },
  ar: {
    brandTagline: "متابعة ذهب قطر مباشرة",
    navDashboard: "لوحة التحكم",
    navVaults: "الخزنات",
    navSources: "المصادر",
    navLogin: "تسجيل الدخول",
    navSignup: "إنشاء حساب",
    localeSwitch: "EN",
    heroEyebrow: "سعر 22 قيراط في قطر الآن",
    heroTitle: "تابع قيمة ذهبك اليوم - قطعة بقطعة.",
    heroSubtitle: "خزنة أنيقة لمجوهراتك وعملاتك وسبائكك. تقديرات مباشرة بالريال القطري من أسعار السوق ولوحات المتاجر.",
    heroCta: "إنشاء حساب",
    heroSecondaryCta: "فتح اللوحة",
    heroBoardLabel: "لكل غرام - السوق الافتراضي قطر",
    heroBoardFresh: "إشارة سوق حديثة من آخر سعر منشور.",
    heroBoardStale: "يتم عرض آخر لقطة متاحة من السوق.",
    heroPulseTitle: "نبض السوق",
    heroPulseCopy: "قراءة واضحة لسعر السوق ولوحة البيع بالتجزئة وحركة السبعة أيام بدون ازدحام بصري.",
    live24k: "24 قيراط مباشر",
    retail22k: "22 قيراط تجزئة",
    retailSpread: "فارق التجزئة",
    pending: "قيد الانتظار",
    freshSignal: "حديث",
    staleSignal: "آخر لقطة",
    featureVaultTitle: "تابع كل قطعة تملكها.",
    featureVaultCopy: "المجوهرات والعملات والسبائك والخردة كلها تعيش في خزنة شخصية هادئة وواضحة.",
    featureClarityTitle: "اعرف القيمة والربح خلال ثوان.",
    featureClarityCopy: "القيمة الجوهرية وسعر التجزئة وتقدير البيع تبقى واضحة ومتناسقة بالريال القطري.",
    featureTrustTitle: "مبني على مصادر مباشرة متوافقة.",
    featureTrustCopy: "جلب أسعار التجزئة محكوم بقواعد الروبوتات وكل لقطة مصدر تحفظ قبل التحليل.",
    dashboardTitle: "ذهبك اليوم",
    dashboardIntro: "قراءة مركزة لآخر قيمة لخزنتك وتكلفة الشراء وحركة كل قطعة.",
    totalValue: "إجمالي القيمة",
    invested: "إجمالي الشراء",
    profitLoss: "الربح/الخسارة",
    lastUpdated: "آخر تحديث",
    addItem: "إضافة قطعة",
    manageVaults: "إدارة الخزنات",
    trackedPieces: "القطع المتابعة",
    emptyItems: "أضف أول قطعة لتبدأ متابعة القيمة اليومية.",
    vaultsTitle: "خزناتك",
    vaultsIntro: "افصل بين المجوهرات والعملات والسبائك أو أي مجموعة تريد متابعتها بشكل مرتب.",
    newVault: "خزنة جديدة",
    vaultName: "اسم الخزنة",
    createVault: "إنشاء الخزنة",
    loginEyebrow: "دخول الإدارة",
    loginTitle: "افتح خزنتك",
    loginIntro: "سجل الدخول لرؤية آخر تقييم وقطعك الأخيرة والأسعار المرتبطة بالمصادر.",
    signupEyebrow: "إنشاء حساب",
    signupTitle: "ابدأ خزنة الذهب الخاصة بك",
    signupIntro: "ابن سجلا واضحا لما اشتريته ووزنه وقيمته اليوم.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    sourcesTitle: "صحة المصادر",
    sourcesIntro: "راقب مصدر السوق ومصدر التجزئة وحداثتهما وأي أعطال تحتاج متابعة.",
    healthy: "سليم",
    stale: "متأخر",
    failures: "الإخفاقات",
    addItemTitle: "إضافة قطعة",
    addItemIntro: "أدخل البيانات الأساسية مرة واحدة ثم دع المنصة تتابع قيمة القطعة لك.",
    category: "الفئة",
    karat: "القيراط",
    grossWeight: "الوزن الإجمالي (غ)",
    stoneWeight: "وزن الأحجار (غ)",
    purchaseDate: "تاريخ الشراء",
    purchaseTotal: "إجمالي الشراء (ر.ق)",
    makingCharges: "أجور المصنعية",
    vat: "ضريبة القيمة المضافة",
    store: "المتجر",
    location: "الموقع",
    notes: "ملاحظات",
    saveItem: "حفظ القطعة",
    itemDetail: "تفاصيل القطعة",
    itemDetailIntro: "التقديرات تختلف حسب المشتري والعلاوة والخصومات. حافظ على تفاصيل الشراء مرتبة هنا.",
    saveChanges: "حفظ التغييرات",
    deleteItem: "حذف القطعة",
    snapshot: "الملخص",
    purchaseContext: "سياق الشراء"
  }
} as const;
