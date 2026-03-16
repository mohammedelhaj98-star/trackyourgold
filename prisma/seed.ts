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
  await prisma.store.upsert({
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
}

main().finally(() => prisma.$disconnect());
