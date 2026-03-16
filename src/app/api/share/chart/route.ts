import { NextResponse } from 'next/server';

function esc(v: string) {
  return v.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = esc(searchParams.get('title') ?? 'TrackYourGold · Gold Price Snapshot');
  const karat = esc(searchParams.get('karat') ?? '24KT');
  const price = esc(searchParams.get('price') ?? '--');
  const rec = esc(searchParams.get('label') ?? 'WAIT');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#020617"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="60" y="90" font-size="42" font-family="Inter,Arial" fill="#f6b500" font-weight="700">TrackYourGold</text>
  <text x="60" y="150" font-size="30" font-family="Inter,Arial" fill="#e2e8f0">${title}</text>
  <rect x="60" y="200" rx="16" ry="16" width="1080" height="300" fill="#0f172acc" stroke="#334155"/>
  <text x="100" y="285" font-size="34" font-family="Inter,Arial" fill="#e2e8f0">Karat: ${karat}</text>
  <text x="100" y="355" font-size="54" font-family="Inter,Arial" fill="#f8fafc" font-weight="700">QAR ${price} / gram</text>
  <text x="100" y="420" font-size="30" font-family="Inter,Arial" fill="#cbd5e1">Recommendation: ${rec}</text>
  <text x="60" y="585" font-size="24" font-family="Inter,Arial" fill="#94a3b8">trackyourgold.com · Informational analysis, not guaranteed investment advice.</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
