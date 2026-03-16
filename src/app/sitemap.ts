import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '', '/gold/qatar', '/history/qatar', '/analysis/qatar', '/best-time/qatar', '/calculators/qar-gold-calculator', '/alerts/price-drop', '/learn-about-gold',
  ].map((p) => ({ url: `https://trackyourgold.com${p}`, lastModified: new Date(), changeFrequency: 'daily', priority: p === '' ? 1 : 0.7 }));
}
