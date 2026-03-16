import { parserVersion, scrapeAndParseMalabar } from '@/lib/scraping/malabar';

async function main() {
  const payload = await scrapeAndParseMalabar();
  console.log(
    JSON.stringify(
      {
        parserVersion,
        sourceUrl: payload.sourceUrl,
        pageTimestamp: payload.pageTimestamp,
        count: payload.rates.length,
        rates: payload.rates,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
