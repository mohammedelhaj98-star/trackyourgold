import { requireEnv } from '@/lib/config/env';
import { scrapeMalabarHtml, parseMalabarRates, parserVersion } from '@/lib/scraping/malabar';

async function main() {
  const html = await scrapeMalabarHtml(requireEnv('MALABAR_URL'));
  const rates = parseMalabarRates(html);
  console.log(JSON.stringify({ parserVersion, count: rates.length, rates }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
