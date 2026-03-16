'use client';

import { useMemo, useState } from 'react';

function num(v: string) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function CalculatorRenderer({ slug }: { slug: string }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');

  const result = useMemo(() => {
    const x = num(a); const y = num(b); const z = num(c);
    switch (slug) {
      case 'qar-gold-calculator': return ((x * y) / 31.1034768).toFixed(3);
      case 'gold-premium-calculator': return y ? (((x - y) / y) * 100).toFixed(2) + '%' : '0%';
      case 'should-i-buy-gold-now': return x <= y ? 'Favorable versus your target.' : 'Wait for better entry.';
      case 'gold-profit-loss-calculator': return ((x - y) * z).toFixed(3);
      case 'making-charge-calculator': return (x + (x * y) / 100).toFixed(3);
      case 'gold-savings-goal-calculator': return y ? (x / y).toFixed(1) + ' months' : '0 months';
      default: return 'Configure calculator';
    }
  }, [a, b, c, slug]);

  return (
    <div className="card space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <input className="rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Input A" value={a} onChange={(e) => setA(e.target.value)} />
        <input className="rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Input B" value={b} onChange={(e) => setB(e.target.value)} />
        <input className="rounded border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Input C" value={c} onChange={(e) => setC(e.target.value)} />
      </div>
      <p className="text-slate-300">Result</p>
      <p className="text-2xl font-semibold">{result}</p>
    </div>
  );
}
