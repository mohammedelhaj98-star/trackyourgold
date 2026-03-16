type AdConfig = { key: string; title: string; enabled: boolean; placeholderMode: boolean; customCode?: string };

const adConfigs: Record<string, AdConfig> = {
  desktop_sidebar: { key: 'desktop_sidebar', title: 'Desktop Sidebar', enabled: true, placeholderMode: true },
  footer_banner: { key: 'footer_banner', title: 'Footer Banner', enabled: true, placeholderMode: true },
  dashboard_slot: { key: 'dashboard_slot', title: 'Dashboard Slot', enabled: true, placeholderMode: true },
};

export function getAdSlotConfig(key: string) {
  return adConfigs[key];
}

export const recommendationDefaults = {
  weights: {
    below30DayAvg: 25,
    below90DayAvg: 20,
    drop24h: 20,
    is90DayLow: 20,
    spikePenalty: -25,
    premiumOverSpotPenalty: -20,
  },
  thresholds: {
    drop24hPercent: 1.25,
    spike24hPercent: 1.75,
    highPremiumPercent: 8,
  },
};
