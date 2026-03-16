import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const qa = await prisma.country.upsert({
    where: { code: 'QA' },
    update: {},
    create: { code: 'QA', name: 'Qatar', slug: 'qatar', currencyCode: 'QAR' },
  });

  const doha = await prisma.city.upsert({
    where: { countryId_slug: { countryId: qa.id, slug: 'doha' } },
    update: {},
    create: { countryId: qa.id, name: 'Doha', slug: 'doha' },
  });

  const malabar = await prisma.store.upsert({
    where: { countryId_slug: { countryId: qa.id, slug: 'malabar-gold-diamonds-qatar' } },
    update: {},
    create: {
      countryId: qa.id,
      cityId: doha.id,
      name: 'Malabar Gold & Diamonds Qatar',
      slug: 'malabar-gold-diamonds-qatar',
      externalUrl: 'https://www.malabargoldanddiamonds.com/',
      description: 'Primary tracked store for launch market.',
    },
  });

  await prisma.globalGoldPrice.create({ data: { provider: 'seed', xauUsd: 3020.5 } });
  await prisma.exchangeRate.create({ data: { provider: 'seed', fromCurrency: 'USD', toCurrency: 'QAR', rate: 3.64 } });

  const samples = [
    { karatCode: '24KT', pricePerGram: 305.5 },
    { karatCode: '22KT', pricePerGram: 280.75 },
    { karatCode: '21KT', pricePerGram: 268.35 },
    { karatCode: '18KT', pricePerGram: 230.1 },
  ];

  await Promise.all(
    samples.map((s) =>
      prisma.goldPriceSnapshot.create({
        data: {
          storeId: malabar.id,
          countryCode: 'QA',
          karatCode: s.karatCode,
          currencyCode: 'QAR',
          pricePerGram: s.pricePerGram,
          parserVersion: 'seed-v1',
          scrapeStatus: 'seeded',
        },
      }),
    ),
  );
}

main().finally(() => prisma.$disconnect());
