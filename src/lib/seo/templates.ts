export function buildSeoTitle(page: string, country: string) {
  return `${page} in ${country} | TrackYourGold`;
}

export function generateCountryInternalLinks(countrySlug: string) {
  return [
    `/gold/${countrySlug}`,
    `/history/${countrySlug}`,
    `/best-time/${countrySlug}`,
    `/guides/${countrySlug}/gold-buying-guide`,
  ];
}
