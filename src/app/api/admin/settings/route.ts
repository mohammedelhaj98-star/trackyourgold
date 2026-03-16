import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { recommendationDefaults } from '@/lib/config/appConfig';

const defaultSettings = {
  premiumEnabled: false,
  adsEnabled: true,
  recommendationDefaults,
};

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json(defaultSettings);
  const rows = await prisma.setting.findMany();
  const record = Object.fromEntries(rows.map((r) => [r.key, r.valueJson]));
  return NextResponse.json({ ...defaultSettings, ...record });
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL required for persistence' }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const entries = Object.entries(body);

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, valueJson: toInputJsonValue(value) },
        update: { valueJson: toInputJsonValue(value) },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
