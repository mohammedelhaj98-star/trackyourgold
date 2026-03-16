import { NextResponse } from 'next/server';
import { parserVersion, scrapeAndParseMalabar } from '@/lib/scraping/malabar';
import { prisma } from '@/lib/db/prisma';

async function runWithRetry(retries = 2) {
  let err: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await scrapeAndParseMalabar();
    } catch (e) {
      err = e;
    }
  }
  throw err;
}

export async function POST() {
  const sourceKey = 'malabar_qatar';
  try {
    const payload = await runWithRetry(2);
    const rates = payload.rates;

    if (process.env.DATABASE_URL) {
      const store = await prisma.store.findFirst({ where: { slug: 'malabar-gold-diamonds-qatar' } });
      if (store) {
        await prisma.rawScrapeSnapshot.create({
          data: {
            sourceKey,
            html: payload.html,
            parserVersion,
            scrapeStatus: 'success',
          },
        });

        await Promise.all(
          rates.map((r) =>
            prisma.goldPriceSnapshot.create({
              data: {
                storeId: store.id,
                countryCode: 'QA',
                karatCode: r.karatCode,
                currencyCode: 'QAR',
                pricePerGram: r.pricePerGram,
                sourceTimestamp:
                  payload.pageTimestamp && !Number.isNaN(new Date(payload.pageTimestamp).getTime())
                    ? new Date(payload.pageTimestamp)
                    : undefined,
                parserVersion,
                scrapeStatus: 'success',
              },
            }),
          ),
        );
      }
    }

    return NextResponse.json({
      ok: true,
      parserVersion,
      sourceUrl: payload.sourceUrl,
      pageTimestamp: payload.pageTimestamp,
      count: rates.length,
      rates,
    });
  } catch (error) {
    if (process.env.DATABASE_URL) {
      await prisma.parserFailure.create({ data: { sourceKey, errorMessage: String(error), parserVersion, retries: 2 } });
      await prisma.rawScrapeSnapshot.create({ data: { sourceKey, html: '', parserVersion, scrapeStatus: 'failed' } });
    }
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
