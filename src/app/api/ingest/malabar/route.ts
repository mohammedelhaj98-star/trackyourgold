import { NextResponse } from 'next/server';
import { requireEnv } from '@/lib/config/env';
import { parseMalabarRates, parserVersion, scrapeMalabarHtml } from '@/lib/scraping/malabar';

export async function POST() {
  try {
    const html = await scrapeMalabarHtml(requireEnv('MALABAR_URL'));
    const rates = parseMalabarRates(html);
    return NextResponse.json({ parserVersion, count: rates.length, rates });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
