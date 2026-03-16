import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'Use scripts/runGlobalIngest.ts for provider logic; API endpoint reserved for webhook/manual triggering.',
  });
}
