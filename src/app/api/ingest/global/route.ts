import { NextResponse } from 'next/server';
import { getGlobalReferenceQuote } from '@/lib/global/providers';
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  try {
    const quote = await getGlobalReferenceQuote();

    if (process.env.DATABASE_URL) {
      await prisma.globalGoldPrice.create({
        data: { provider: quote.provider, xauUsd: quote.xauUsd },
      });
      await prisma.exchangeRate.create({
        data: { provider: quote.provider, fromCurrency: 'USD', toCurrency: 'QAR', rate: quote.usdQar },
      });
    }

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
