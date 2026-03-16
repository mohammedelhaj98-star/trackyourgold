import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, note: 'Chart image generation endpoint placeholder with TrackYourGold branding.' });
}
