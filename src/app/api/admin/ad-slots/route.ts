import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ slots: ['desktop_sidebar', 'footer_banner', 'dashboard_slot'] });
}
