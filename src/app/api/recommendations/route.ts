import { NextResponse } from 'next/server';
import { buildRecommendation } from '@/lib/recommendation/engine';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const recommendation = buildRecommendation(body);

  if (process.env.DATABASE_URL) {
    await prisma.recommendation.create({
      data: {
        countryCode: body.countryCode ?? 'QA',
        karatCode: body.karatCode ?? '24KT',
        label: recommendation.label,
        score: recommendation.score,
        explanation: recommendation.explanation,
        confidenceNote: recommendation.confidenceNote,
        reasons: {
          create: recommendation.reasons.map((reason, idx) => ({
            key: `reason_${idx + 1}`,
            weight: 0,
            value: 0,
            reasonText: reason,
          })),
        },
      },
    });
  }

  return NextResponse.json(recommendation);
}
