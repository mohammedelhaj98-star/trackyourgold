import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  await prisma.emailSubscriber.upsert({
    where: { email: body.email },
    create: { email: body.email, sourcePage: body.sourcePage ?? 'unknown', countryCode: 'QA' },
    update: { sourcePage: body.sourcePage ?? 'unknown' },
  });
  return NextResponse.json({ ok: true });
}
