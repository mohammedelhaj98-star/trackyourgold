import { NextResponse } from 'next/server';
import { getLatestMarketView } from '@/lib/data/market';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = (searchParams.get('countryCode') ?? 'QA').toUpperCase();
    const data = await getLatestMarketView(countryCode);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
