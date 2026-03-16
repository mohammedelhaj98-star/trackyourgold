import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAdSlotConfig } from '@/lib/config/appConfig';

const defaultKeys = ['desktop_sidebar', 'footer_banner', 'dashboard_slot'];

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      slots: defaultKeys.map((key) => getAdSlotConfig(key)).filter(Boolean),
      persisted: false,
    });
  }

  const slots = await prisma.adSlot.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json({ slots, persisted: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL required for persistence' }, { status: 400 });
  }

  const slot = await prisma.adSlot.upsert({
    where: { key: body.key },
    create: {
      key: body.key,
      title: body.title ?? body.key,
      enabled: body.enabled ?? true,
      placeholderMode: body.placeholderMode ?? true,
      customCode: body.customCode ?? null,
      placement: body.placement ?? 'custom',
    },
    update: {
      title: body.title,
      enabled: body.enabled,
      placeholderMode: body.placeholderMode,
      customCode: body.customCode,
      placement: body.placement,
    },
  });

  return NextResponse.json({ ok: true, slot });
}
