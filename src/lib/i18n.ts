export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

const englishMessages = {
  brandTagline: "Private gold net worth for Qatar",
  localeSwitch: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  nav: {
    home: "Home",
    portfolio: "Portfolio",
    progress: "Progress",
    settings: "Settings",
    login: "Login",
    signup: "Create account",
    logout: "Logout",
    addGold: "Add gold"
  },
  common: {
    pending: "Pending",
    healthy: "Healthy",
    stale: "Stale",
    live: "Live",
    ad: "Ad",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    lastUpdated: "Last updated",
    freshData: "Fresh data",
    staleData: "Latest snapshot",
    currency: "Currency",
    language: "Language",
    privacy: "Privacy",
    learnMore: "Learn more",
    noData: "No data yet",
    worthNow: "Worth now",
    gainLoss: "Gain/Loss",
    profitLoss: "Profit/Loss",
    invested: "Invested",
    totalValue: "Total value",
    fineGoldGrams: "Fine gold grams",
    live22k: "Live 22K",
    live24k: "Live 24K",
    retail22k: "Retail 22K",
    qatarDefault: "QAR default"
  },
  hero: {
    eyebrow: "Private gold tracker",
    title: "Track what your gold is worth today — piece by piece.",
    subtitle:
      "A calm vault for your jewelry, coins, and bars, with live QAR reads from market rates and local retail boards.",
    primaryCta: "Create account",
    secondaryCta: "Open live dashboard",
    signalFresh: "Fresh market signal",
    signalStale: "Latest available snapshot",
    pulseTitle: "Market pulse",
    pulseCopy: "See the live market board, retail board, and short-term movement without finance clutter.",
    rateLabel: "Qatar default · per gram"
  },
  home: {
    title: "Your gold today",
    intro: "A clean read on your private gold net worth, live pricing, and progress.",
    progressToNextTier: "Progress to next tier",
    viewPortfolio: "View portfolio",
    viewLiveMarket: "View live market",
    emptyTitle: "Your vault is empty",
    emptyCopy: "Add your first gold piece to see your net worth, fine gold grams, and progress.",
    unavailableTitle: "Live pricing is temporarily unavailable",
    unavailableCopy: "We are showing your saved holdings. Market-based values will return automatically.",
    chartPortfolio: "Portfolio value",
    chartMarket: "22K market trend",
    recentHoldings: "Recent holdings",
    noRecentHoldings: "No holdings yet. Start with grams and karat and add purchase basis later if you want it.",
    marketStripTitle: "Market intelligence",
    holdingsCount: "Holdings",
    newestAchievement: "Newest achievement"
  },
  portfolio: {
    title: "All holdings",
    intro: "Everything you own in one calm list, with the live worth of each holding in QAR.",
    totalHoldings: "Total holdings",
    searchPlaceholder: "Search label, vault, or tag",
    searchLabel: "Search",
    filterKarat: "Karat",
    filterTag: "Tag",
    sortBy: "Sort",
    sortNewest: "Newest",
    sortHighestValue: "Highest value",
    sortBestGain: "Best gain",
    sortMostGrams: "Most grams",
    noHoldingsTitle: "No holdings yet",
    noHoldingsCopy: "Start with grams and karat. Purchase details are optional and can be added later.",
    strongestHolding: "Top holding right now",
    filterSummary: "Portfolio filters",
    vaultsCardTitle: "Vaults",
    createVault: "Create vault",
    vaultName: "Vault name",
    allKarats: "All karats",
    allTags: "All tags",
    newest: "Newest"
  },
  holding: {
    title: "Holding detail",
    intro: "A single-piece view of current worth, purchase basis, and live market context.",
    weightAndKarat: "Weight and karat",
    purchaseBasis: "Purchase basis",
    notes: "Notes",
    marketContext: "Market context",
    chartTitle: "Holding value",
    deletePrompt: "Delete this holding",
    deleteWarning: "This removes the holding from your private vault."
  },
  addGold: {
    title: "Add gold",
    intro: "Capture the essentials now and keep the rest lightweight.",
    label: "Label",
    labelPlaceholder: "Optional name for this piece",
    grams: "Grams",
    karat: "Karat",
    addPurchaseBasis: "Add purchase price",
    purchasePriceMode: "Price type",
    totalPrice: "Total",
    perGramPrice: "Per gram",
    purchasePrice: "Purchase price",
    purchaseDate: "Purchase date",
    tags: "Tags",
    notes: "Notes",
    notesPlaceholder: "Optional notes about this piece",
    save: "Save to vault",
    instantPanel: "Instant feedback",
    breakEven: "Break-even per gram",
    fineGoldAdded: "Fine gold grams added",
    progressToNextTier: "Progress to next tier",
    validationGrams: "Enter grams greater than zero.",
    validationFutureDate: "Purchase date cannot be in the future.",
    validationPrice: "Enter a valid purchase price to calculate gain/loss.",
    validationWeightSoft: "That weight is unusually high. Please confirm it is correct.",
    addedToVault: "Added to vault",
    purchaseOptionalCopy: "Purchase basis stays optional. If you skip it, we still track worth now."
  },
  progress: {
    title: "Progress",
    intro: "Progress is based on your total fine gold grams, not market swings.",
    currentTier: "Current tier",
    nextTier: "Next tier",
    gramsToNextTier: "Grams to next tier",
    achievements: "Achievements",
    noAchievements: "Add your first piece to unlock your first achievement.",
    starter: "Starter",
    builder: "Builder",
    keeper: "Keeper",
    treasury: "Treasury",
    legacy: "Legacy",
    emptyTitle: "Progress starts with your first piece",
    emptyCopy: "Add gold to unlock your first tier and achievements."
  },
  settings: {
    title: "Settings",
    intro: "Private-by-default controls for how you read your vault and market data.",
    valuationPreferences: "Valuation preferences",
    showRetailComparison: "Show retail comparison",
    showGainLossWhenBasisExists: "Show gain/loss when purchase basis exists",
    reduceMotion: "Reduce motion",
    privateAccountTitle: "Private account",
    privateAccountCopy: "Your holdings are private. There are no public feeds, sharing loops, or social features.",
    dataFreshness: "Data freshness",
    disclaimersTitle: "Disclaimers",
    disclaimersCopy:
      "Values are estimates based on market and retail inputs. They are useful guides, not guarantees or financial advice.",
    adsTitle: "About ads",
    adsCopy: "Ads keep the app free. They are always labeled and never interrupt critical actions.",
    savePreferences: "Save preferences",
    preferencesSaved: "Preferences saved",
    sourceFailures: "Failures"
  },
  auth: {
    loginEyebrow: "Private access",
    loginTitle: "Open your vault",
    loginIntro: "Sign in to see your holdings, gold net worth, and progress.",
    signupEyebrow: "Create account",
    signupTitle: "Start your private vault",
    signupIntro: "Track grams, karat, and live value in QAR with a clean private setup.",
    email: "Email",
    password: "Password"
  },
  achievements: {
    firstPiece: "First Piece",
    pure10: "10g Pure",
    pure50: "50g Pure",
    pure100: "100g Pure",
    wellDocumented: "Well Documented",
    collectorMix: "Collector Mix",
    taggedVault: "Tagged Vault",
    quarterKilo: "Quarter Kilo",
    unlocked: "Achievement unlocked"
  },
  tags: {
    Jewelry: "Jewelry",
    Coin: "Coin",
    Bar: "Bar",
    Gift: "Gift",
    Wedding: "Wedding",
    Investment: "Investment"
  },
  categories: {
    JEWELRY: "Jewelry",
    COIN: "Coin",
    BAR: "Bar",
    SCRAP: "Scrap",
    OTHER: "Other"
  }
};

export type MessageCatalog = typeof englishMessages;

const arabicMessages: MessageCatalog = {
  brandTagline: "\u0635\u0627\u0641\u064a \u062b\u0631\u0648\u062a\u0643 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628 \u0641\u064a \u0642\u0637\u0631",
  localeSwitch: "EN",
  nav: {
    home: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    portfolio: "\u0627\u0644\u0645\u062d\u0641\u0638\u0629",
    progress: "\u0627\u0644\u062a\u0642\u062f\u0645",
    settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    login: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    signup: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
    logout: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    addGold: "\u0625\u0636\u0627\u0641\u0629 \u0630\u0647\u0628"
  },
  common: {
    pending: "\u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631",
    healthy: "\u0633\u0644\u064a\u0645",
    stale: "\u0645\u062a\u0623\u062e\u0631",
    live: "\u0645\u0628\u0627\u0634\u0631",
    ad: "\u0625\u0639\u0644\u0627\u0646",
    save: "\u062d\u0641\u0638",
    cancel: "\u0625\u0644\u063a\u0627\u0621",
    delete: "\u062d\u0630\u0641",
    lastUpdated: "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b",
    freshData: "\u0628\u064a\u0627\u0646\u0627\u062a \u062d\u062f\u064a\u062b\u0629",
    staleData: "\u0622\u062e\u0631 \u0644\u0642\u0637\u0629",
    currency: "\u0627\u0644\u0639\u0645\u0644\u0629",
    language: "\u0627\u0644\u0644\u063a\u0629",
    privacy: "\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
    learnMore: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f",
    noData: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0639\u062f",
    worthNow: "\u0642\u064a\u0645\u062a\u0647\u0627 \u0627\u0644\u0622\u0646",
    gainLoss: "\u0627\u0644\u0631\u0628\u062d/\u0627\u0644\u062e\u0633\u0627\u0631\u0629",
    profitLoss: "\u0627\u0644\u0631\u0628\u062d/\u0627\u0644\u062e\u0633\u0627\u0631\u0629",
    invested: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0634\u0631\u0627\u0621",
    totalValue: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0642\u064a\u0645\u0629",
    fineGoldGrams: "\u063a\u0631\u0627\u0645\u0627\u062a \u0627\u0644\u0630\u0647\u0628 \u0627\u0644\u0635\u0627\u0641\u064a\u0629",
    live22k: "22 \u0642\u064a\u0631\u0627\u0637 \u0645\u0628\u0627\u0634\u0631",
    live24k: "24 \u0642\u064a\u0631\u0627\u0637 \u0645\u0628\u0627\u0634\u0631",
    retail22k: "22 \u0642\u064a\u0631\u0627\u0637 \u062a\u062c\u0632\u0626\u0629",
    qatarDefault: "\u0627\u0644\u0631\u064a\u0627\u0644 \u0627\u0644\u0642\u0637\u0631\u064a \u0627\u0641\u062a\u0631\u0627\u0636\u064a"
  },
  hero: {
    eyebrow: "\u0645\u062a\u0627\u0628\u0639\u0629 \u062e\u0627\u0635\u0629 \u0644\u0644\u0630\u0647\u0628",
    title: "\u062a\u0627\u0628\u0639 \u0642\u064a\u0645\u0629 \u0630\u0647\u0628\u0643 \u0627\u0644\u064a\u0648\u0645 \u2014 \u0642\u0637\u0639\u0629 \u0628\u0642\u0637\u0639\u0629.",
    subtitle:
      "\u062e\u0632\u0646\u0629 \u0647\u0627\u062f\u0626\u0629 \u0644\u0645\u062c\u0648\u0647\u0631\u0627\u062a\u0643 \u0648\u0639\u0645\u0644\u0627\u062a\u0643 \u0648\u0633\u0628\u0627\u0626\u0643\u0643 \u0645\u0639 \u0642\u0631\u0627\u0621\u0627\u062a \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0627\u0644\u0631\u064a\u0627\u0644 \u0627\u0644\u0642\u0637\u0631\u064a.",
    primaryCta: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
    secondaryCta: "\u0641\u062a\u062d \u0627\u0644\u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629",
    signalFresh: "\u0625\u0634\u0627\u0631\u0629 \u0633\u0648\u0642 \u062d\u062f\u064a\u062b\u0629",
    signalStale: "\u0622\u062e\u0631 \u0644\u0642\u0637\u0629 \u0645\u062a\u0627\u062d\u0629",
    pulseTitle: "\u0646\u0628\u0636 \u0627\u0644\u0633\u0648\u0642",
    pulseCopy: "\u0634\u0627\u0647\u062f \u0644\u0648\u062d\u0629 \u0627\u0644\u0633\u0648\u0642 \u0648\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0648\u062d\u0631\u0643\u0629 \u0627\u0644\u0645\u062f\u0649 \u0627\u0644\u0642\u0635\u064a\u0631 \u0628\u062f\u0648\u0646 \u062a\u0639\u0642\u064a\u062f.",
    rateLabel: "\u0642\u0637\u0631 \u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0627 \u00b7 \u0644\u0643\u0644 \u063a\u0631\u0627\u0645"
  },
  home: {
    title: "\u0630\u0647\u0628\u0643 \u0627\u0644\u064a\u0648\u0645",
    intro: "\u0642\u0631\u0627\u0621\u0629 \u0647\u0627\u062f\u0626\u0629 \u0644\u0635\u0627\u0641\u064a \u062b\u0631\u0648\u062a\u0643 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628 \u0648\u0627\u0644\u062a\u0633\u0639\u064a\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0648\u062a\u0642\u062f\u0645\u0643.",
    progressToNextTier: "\u0627\u0644\u062a\u0642\u062f\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    viewPortfolio: "\u0639\u0631\u0636 \u0627\u0644\u0645\u062d\u0641\u0638\u0629",
    viewLiveMarket: "\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631",
    emptyTitle: "\u062e\u0632\u0646\u062a\u0643 \u0641\u0627\u0631\u063a\u0629",
    emptyCopy: "\u0623\u0636\u0641 \u0623\u0648\u0644 \u0642\u0637\u0639\u0629 \u0630\u0647\u0628 \u0644\u062a\u0631\u0649 \u0635\u0627\u0641\u064a \u0627\u0644\u0642\u064a\u0645\u0629 \u0648\u063a\u0631\u0627\u0645\u0627\u062a \u0627\u0644\u0630\u0647\u0628 \u0627\u0644\u0635\u0627\u0641\u064a\u0629 \u0648\u0627\u0644\u062a\u0642\u062f\u0645.",
    unavailableTitle: "\u0627\u0644\u062a\u0633\u0639\u064a\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0645\u0624\u0642\u062a\u0627",
    unavailableCopy: "\u0646\u0639\u0631\u0636 \u0645\u0642\u062a\u0646\u064a\u0627\u062a\u0643 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629 \u0627\u0644\u0622\u0646. \u0633\u062a\u0639\u0648\u062f \u0627\u0644\u0642\u064a\u0645 \u0627\u0644\u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0633\u0648\u0642 \u062a\u0644\u0642\u0627\u0626\u064a\u0627.",
    chartPortfolio: "\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u062d\u0641\u0638\u0629",
    chartMarket: "\u0627\u062a\u062c\u0627\u0647 22 \u0642\u064a\u0631\u0627\u0637",
    recentHoldings: "\u0623\u062d\u062f\u062b \u0627\u0644\u0645\u0642\u062a\u0646\u064a\u0627\u062a",
    noRecentHoldings:
      "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0642\u062a\u0646\u064a\u0627\u062a \u0628\u0639\u062f. \u0627\u0628\u062f\u0623 \u0628\u0627\u0644\u063a\u0631\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0642\u064a\u0631\u0627\u0637 \u0648\u0623\u0636\u0641 \u0623\u0633\u0627\u0633 \u0627\u0644\u0634\u0631\u0627\u0621 \u0644\u0627\u062d\u0642\u0627 \u0625\u0646 \u0623\u0631\u062f\u062a.",
    marketStripTitle: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0633\u0648\u0642",
    holdingsCount: "\u0639\u062f\u062f \u0627\u0644\u0645\u0642\u062a\u0646\u064a\u0627\u062a",
    newestAchievement: "\u0622\u062e\u0631 \u0625\u0646\u062c\u0627\u0632"
  },
  portfolio: {
    title: "\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0642\u062a\u0646\u064a\u0627\u062a",
    intro: "\u0643\u0644 \u0645\u0627 \u062a\u0645\u0644\u0643\u0647 \u0641\u064a \u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u062f\u0626\u0629 \u0645\u0639 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u062d\u064a\u0629 \u0644\u0643\u0644 \u0642\u0637\u0639\u0629.",
    totalHoldings: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0642\u062a\u0646\u064a\u0627\u062a",
    searchPlaceholder: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0627\u0633\u0645 \u0623\u0648 \u062e\u0632\u0646\u0629 \u0623\u0648 \u0648\u0633\u0645",
    searchLabel: "\u0628\u062d\u062b",
    filterKarat: "\u0627\u0644\u0642\u064a\u0631\u0627\u0637",
    filterTag: "\u0627\u0644\u0648\u0633\u0645",
    sortBy: "\u0627\u0644\u062a\u0631\u062a\u064a\u0628",
    sortNewest: "\u0627\u0644\u0623\u062d\u062f\u062b",
    sortHighestValue: "\u0627\u0644\u0623\u0639\u0644\u0649 \u0642\u064a\u0645\u0629",
    sortBestGain: "\u0623\u0641\u0636\u0644 \u0631\u0628\u062d",
    sortMostGrams: "\u0627\u0644\u0623\u0643\u062b\u0631 \u063a\u0631\u0627\u0645\u0627\u062a",
    noHoldingsTitle: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0642\u062a\u0646\u064a\u0627\u062a \u0628\u0639\u062f",
    noHoldingsCopy: "\u0627\u0628\u062f\u0623 \u0628\u0627\u0644\u063a\u0631\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0642\u064a\u0631\u0627\u0637. \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0629 \u0648\u064a\u0645\u0643\u0646 \u0625\u0636\u0627\u0641\u062a\u0647\u0627 \u0644\u0627\u062d\u0642\u0627.",
    strongestHolding: "\u0623\u0642\u0648\u0649 \u0642\u0637\u0639\u0629 \u0627\u0644\u0622\u0646",
    filterSummary: "\u0645\u0631\u0634\u062d\u0627\u062a \u0627\u0644\u0645\u062d\u0641\u0638\u0629",
    vaultsCardTitle: "\u0627\u0644\u062e\u0632\u0646\u0627\u062a",
    createVault: "\u0625\u0646\u0634\u0627\u0621 \u062e\u0632\u0646\u0629",
    vaultName: "\u0627\u0633\u0645 \u0627\u0644\u062e\u0632\u0646\u0629",
    allKarats: "\u0643\u0644 \u0627\u0644\u0642\u064a\u0631\u0627\u0637\u0627\u062a",
    allTags: "\u0643\u0644 \u0627\u0644\u0648\u0633\u0648\u0645",
    newest: "\u0627\u0644\u0623\u062d\u062f\u062b"
  },
  holding: {
    title: "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0642\u0637\u0639\u0629",
    intro: "\u0639\u0631\u0636 \u0648\u0627\u0636\u062d \u0644\u0642\u064a\u0645\u062a\u0647\u0627 \u0627\u0644\u062d\u0627\u0644\u064a\u0629 \u0648\u0623\u0633\u0627\u0633 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0633\u064a\u0627\u0642 \u0627\u0644\u0633\u0648\u0642.",
    weightAndKarat: "\u0627\u0644\u0648\u0632\u0646 \u0648\u0627\u0644\u0642\u064a\u0631\u0627\u0637",
    purchaseBasis: "\u0623\u0633\u0627\u0633 \u0627\u0644\u0634\u0631\u0627\u0621",
    notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
    marketContext: "\u0633\u064a\u0627\u0642 \u0627\u0644\u0633\u0648\u0642",
    chartTitle: "\u0642\u064a\u0645\u0629 \u0627\u0644\u0642\u0637\u0639\u0629",
    deletePrompt: "\u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629",
    deleteWarning: "\u0633\u064a\u0624\u062f\u064a \u0647\u0630\u0627 \u0625\u0644\u0649 \u0625\u0632\u0627\u0644\u062a\u0647\u0627 \u0645\u0646 \u062e\u0632\u0646\u062a\u0643 \u0627\u0644\u062e\u0627\u0635\u0629."
  },
  addGold: {
    title: "\u0625\u0636\u0627\u0641\u0629 \u0630\u0647\u0628",
    intro: "\u0633\u062c\u0644 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0627\u062a \u0627\u0644\u0622\u0646 \u0648\u0623\u0628\u0642\u0650 \u0627\u0644\u0628\u0627\u0642\u064a \u0628\u0633\u064a\u0637\u0627.",
    label: "\u0627\u0644\u0627\u0633\u0645",
    labelPlaceholder: "\u0627\u0633\u0645 \u0627\u062e\u062a\u064a\u0627\u0631\u064a \u0644\u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629",
    grams: "\u0627\u0644\u063a\u0631\u0627\u0645\u0627\u062a",
    karat: "\u0627\u0644\u0642\u064a\u0631\u0627\u0637",
    addPurchaseBasis: "\u0625\u0636\u0627\u0641\u0629 \u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621",
    purchasePriceMode: "\u0646\u0648\u0639 \u0627\u0644\u0633\u0639\u0631",
    totalPrice: "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a",
    perGramPrice: "\u0644\u0643\u0644 \u063a\u0631\u0627\u0645",
    purchasePrice: "\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621",
    purchaseDate: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0634\u0631\u0627\u0621",
    tags: "\u0627\u0644\u0648\u0633\u0648\u0645",
    notes: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a",
    notesPlaceholder: "\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0629 \u062d\u0648\u0644 \u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629",
    save: "\u062d\u0641\u0638 \u0641\u064a \u0627\u0644\u062e\u0632\u0646\u0629",
    instantPanel: "\u062a\u063a\u0630\u064a\u0629 \u0641\u0648\u0631\u064a\u0629",
    breakEven: "\u0633\u0639\u0631 \u0627\u0644\u062a\u0639\u0627\u062f\u0644 \u0644\u0643\u0644 \u063a\u0631\u0627\u0645",
    fineGoldAdded: "\u063a\u0631\u0627\u0645\u0627\u062a \u0627\u0644\u0630\u0647\u0628 \u0627\u0644\u0635\u0627\u0641\u064a\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629",
    progressToNextTier: "\u0627\u0644\u062a\u0642\u062f\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    validationGrams: "\u0623\u062f\u062e\u0644 \u063a\u0631\u0627\u0645\u0627\u062a \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631.",
    validationFutureDate: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0634\u0631\u0627\u0621 \u0644\u0627 \u064a\u0645\u0643\u0646 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0641\u064a \u0627\u0644\u0645\u0633\u062a\u0642\u0628\u0644.",
    validationPrice: "\u0623\u062f\u062e\u0644 \u0633\u0639\u0631\u0627 \u0635\u062d\u064a\u062d\u0627 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0631\u0628\u062d \u0623\u0648 \u0627\u0644\u062e\u0633\u0627\u0631\u0629.",
    validationWeightSoft: "\u0647\u0630\u0627 \u0627\u0644\u0648\u0632\u0646 \u0643\u0628\u064a\u0631 \u0628\u0634\u0643\u0644 \u063a\u064a\u0631 \u0645\u0639\u062a\u0627\u062f. \u0631\u062c\u0627\u0621 \u062a\u0623\u0643\u064a\u062f\u0647.",
    addedToVault: "\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u062a\u0647 \u0625\u0644\u0649 \u0627\u0644\u062e\u0632\u0646\u0629",
    purchaseOptionalCopy: "\u0623\u0633\u0627\u0633 \u0627\u0644\u0634\u0631\u0627\u0621 \u064a\u0628\u0642\u0649 \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0627. \u0625\u0630\u0627 \u062a\u062e\u0637\u064a\u062a\u0647\u060c \u0641\u0646\u062d\u0646 \u0645\u0627 \u0632\u0644\u0646\u0627 \u0646\u062a\u0627\u0628\u0639 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0622\u0646."
  },
  progress: {
    title: "\u0627\u0644\u062a\u0642\u062f\u0645",
    intro: "\u064a\u062d\u062a\u0633\u0628 \u0627\u0644\u062a\u0642\u062f\u0645 \u0628\u0646\u0627\u0621 \u0639\u0644\u0649 \u063a\u0631\u0627\u0645\u0627\u062a \u0627\u0644\u0630\u0647\u0628 \u0627\u0644\u0635\u0627\u0641\u064a\u0629 \u0648\u0644\u064a\u0633 \u062a\u0642\u0644\u0628\u0627\u062a \u0627\u0644\u0633\u0648\u0642.",
    currentTier: "\u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629",
    nextTier: "\u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    gramsToNextTier: "\u063a\u0631\u0627\u0645\u0627\u062a \u0644\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    achievements: "\u0627\u0644\u0625\u0646\u062c\u0627\u0632\u0627\u062a",
    noAchievements: "\u0623\u0636\u0641 \u0623\u0648\u0644 \u0642\u0637\u0639\u0629 \u0644\u0641\u062a\u062d \u0623\u0648\u0644 \u0625\u0646\u062c\u0627\u0632.",
    starter: "\u0628\u062f\u0627\u064a\u0629",
    builder: "\u0628\u0627\u0646\u064a",
    keeper: "\u062d\u0627\u0641\u0638",
    treasury: "\u062e\u0632\u064a\u0646\u0629",
    legacy: "\u0625\u0631\u062b",
    emptyTitle: "\u0627\u0644\u062a\u0642\u062f\u0645 \u064a\u0628\u062f\u0623 \u0645\u0639 \u0623\u0648\u0644 \u0642\u0637\u0639\u0629",
    emptyCopy: "\u0623\u0636\u0641 \u0630\u0647\u0628\u0627 \u0644\u0641\u062a\u062d \u0623\u0648\u0644 \u0645\u0631\u062d\u0644\u0629 \u0648\u0623\u0648\u0644 \u0625\u0646\u062c\u0627\u0632."
  },
  settings: {
    title: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    intro: "\u062a\u062d\u0643\u0645 \u0628\u0646\u0638\u0631\u062a\u0643 \u0644\u0644\u0645\u062d\u0641\u0638\u0629 \u0648\u0627\u0644\u0633\u0648\u0642 \u0628\u0634\u0643\u0644 \u062e\u0627\u0635 \u0648\u0647\u0627\u062f\u0626.",
    valuationPreferences: "\u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u062a\u0642\u064a\u064a\u0645",
    showRetailComparison: "\u0625\u0638\u0647\u0627\u0631 \u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u062a\u062c\u0632\u0626\u0629",
    showGainLossWhenBasisExists: "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0628\u062d/\u0627\u0644\u062e\u0633\u0627\u0631\u0629 \u0639\u0646\u062f \u062a\u0648\u0641\u0631 \u0623\u0633\u0627\u0633 \u0627\u0644\u0634\u0631\u0627\u0621",
    reduceMotion: "\u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u062d\u0631\u0643\u0629",
    privateAccountTitle: "\u062d\u0633\u0627\u0628 \u062e\u0627\u0635",
    privateAccountCopy: "\u0645\u0642\u062a\u0646\u064a\u0627\u062a\u0643 \u062e\u0627\u0635\u0629. \u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0634\u0627\u0631\u0643\u0629 \u0639\u0627\u0645\u0629 \u0623\u0648 \u0645\u064a\u0632\u0627\u062a \u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629.",
    dataFreshness: "\u062d\u062f\u0627\u062b\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
    disclaimersTitle: "\u0625\u0628\u0631\u0627\u0621\u0627\u062a",
    disclaimersCopy:
      "\u0627\u0644\u0642\u064a\u0645 \u0647\u064a \u062a\u0642\u062f\u064a\u0631\u0627\u062a \u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0645\u062f\u062e\u0644\u0627\u062a \u0627\u0644\u0633\u0648\u0642 \u0648\u0627\u0644\u062a\u062c\u0632\u0626\u0629. \u0647\u064a \u062f\u0644\u064a\u0644 \u0645\u0641\u064a\u062f \u0648\u0644\u064a\u0633\u062a \u0636\u0645\u0627\u0646\u0627 \u0623\u0648 \u0646\u0635\u064a\u062d\u0629 \u0645\u0627\u0644\u064a\u0629.",
    adsTitle: "\u062d\u0648\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a",
    adsCopy:
      "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u062a\u062d\u0627\u0641\u0638 \u0639\u0644\u0649 \u0645\u062c\u0627\u0646\u064a\u0629 \u0627\u0644\u062a\u0637\u0628\u064a\u0642. \u062f\u0627\u0626\u0645\u0627 \u062a\u0643\u0648\u0646 \u0645\u0639\u0644\u0645\u0629 \u0648\u0644\u0627 \u062a\u0642\u0627\u0637\u0639 \u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0645\u0647\u0645\u0629.",
    savePreferences: "\u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a",
    preferencesSaved: "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a",
    sourceFailures: "\u0627\u0644\u0625\u062e\u0641\u0627\u0642\u0627\u062a"
  },
  auth: {
    loginEyebrow: "\u062f\u062e\u0648\u0644 \u062e\u0627\u0635",
    loginTitle: "\u0627\u0641\u062a\u062d \u062e\u0632\u0646\u062a\u0643",
    loginIntro: "\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0645\u0634\u0627\u0647\u062f\u0629 \u0645\u0642\u062a\u0646\u064a\u0627\u062a\u0643 \u0648\u0635\u0627\u0641\u064a \u0642\u064a\u0645\u062a\u0647\u0627 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628 \u0648\u062a\u0642\u062f\u0645\u0643.",
    signupEyebrow: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
    signupTitle: "\u0627\u0628\u062f\u0623 \u062e\u0632\u0646\u062a\u0643 \u0627\u0644\u062e\u0627\u0635\u0629",
    signupIntro: "\u062a\u0627\u0628\u0639 \u0627\u0644\u063a\u0631\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0642\u064a\u0631\u0627\u0637 \u0648\u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u062d\u064a\u0629 \u0628\u0627\u0644\u0631\u064a\u0627\u0644 \u0627\u0644\u0642\u0637\u0631\u064a \u0636\u0645\u0646 \u0625\u0639\u062f\u0627\u062f \u062e\u0627\u0635 \u0648\u0627\u0636\u062d.",
    email: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"
  },
  achievements: {
    firstPiece: "\u0623\u0648\u0644 \u0642\u0637\u0639\u0629",
    pure10: "10g \u0635\u0627\u0641\u064a",
    pure50: "50g \u0635\u0627\u0641\u064a",
    pure100: "100g \u0635\u0627\u0641\u064a",
    wellDocumented: "\u0645\u0648\u062b\u0642 \u0628\u0634\u0643\u0644 \u062c\u064a\u062f",
    collectorMix: "\u062a\u0646\u0648\u0639 \u0627\u0644\u0645\u062c\u0645\u0639",
    taggedVault: "\u062e\u0632\u0646\u0629 \u0645\u0648\u0633\u0648\u0645\u0629",
    quarterKilo: "\u0631\u0628\u0639 \u0643\u064a\u0644\u0648",
    unlocked: "\u062a\u0645 \u0641\u062a\u062d \u0625\u0646\u062c\u0627\u0632"
  },
  tags: {
    Jewelry: "\u0645\u062c\u0648\u0647\u0631\u0627\u062a",
    Coin: "\u0639\u0645\u0644\u0629",
    Bar: "\u0633\u0628\u064a\u0643\u0629",
    Gift: "\u0647\u062f\u064a\u0629",
    Wedding: "\u0632\u0641\u0627\u0641",
    Investment: "\u0627\u0633\u062a\u062b\u0645\u0627\u0631"
  },
  categories: {
    JEWELRY: "\u0645\u062c\u0648\u0647\u0631\u0627\u062a",
    COIN: "\u0639\u0645\u0644\u0629",
    BAR: "\u0633\u0628\u064a\u0643\u0629",
    SCRAP: "\u062e\u0631\u062f\u0629",
    OTHER: "\u0623\u062e\u0631\u0649"
  }
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
  en: englishMessages,
  ar: arabicMessages
};

export function getTierLabel(copy: MessageCatalog, tier: "starter" | "builder" | "keeper" | "treasury" | "legacy") {
  switch (tier) {
    case "builder":
      return copy.progress.builder;
    case "keeper":
      return copy.progress.keeper;
    case "treasury":
      return copy.progress.treasury;
    case "legacy":
      return copy.progress.legacy;
    case "starter":
    default:
      return copy.progress.starter;
  }
}

export function getAchievementLabel(copy: MessageCatalog, key: string) {
  switch (key) {
    case "10g-pure":
      return copy.achievements.pure10;
    case "50g-pure":
      return copy.achievements.pure50;
    case "100g-pure":
      return copy.achievements.pure100;
    case "well-documented":
      return copy.achievements.wellDocumented;
    case "collector-mix":
      return copy.achievements.collectorMix;
    case "tagged-vault":
      return copy.achievements.taggedVault;
    case "quarter-kilo":
      return copy.achievements.quarterKilo;
    case "first-piece":
    default:
      return copy.achievements.firstPiece;
  }
}
