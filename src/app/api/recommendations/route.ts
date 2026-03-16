import { buildRecommendation } from '@/lib/recommendation/engine';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const recommendation = buildRecommendation(body);
  return NextResponse.json(recommendation);
}
