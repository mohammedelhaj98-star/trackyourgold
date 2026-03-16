import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.eventName) {
    return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    await prisma.internalAnalytics.create({
      data: {
        eventName: body.eventName,
        pagePath: body.pagePath,
        countryCode: body.countryCode,
        referrer: body.referrer,
        metadataJson: body.metadata ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
