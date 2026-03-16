'use client';

import { useMemo, useState } from 'react';

type Row = { grams: number; buy: number; current: number };

export default function PortfolioPage() {
  const [rows, setRows] = useState<Row[]>([{ grams: 10, buy: 280, current: 300 }]);

  const totals = useMemo(() => {
    const grams = rows.reduce((a, r) => a + r.grams, 0);
    const spent = rows.reduce((a, r) => a + r.grams * r.buy, 0);
    const value = rows.reduce((a, r) => a + r.grams * r.current, 0);
    return { grams, spent, value, pnl: value - spent };
  }, [rows]);

  return (
    <main className="container-page space-y-4">
      <h1 className="text-3xl font-semibold">Portfolio Tracker</h1>
      <div className="card space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-4">
            <input className="rounded border border-slate-700 bg-slate-950 px-2 py-1" value={r.grams} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, grams: Number(e.target.value) || 0 } : x))} />
            <input className="rounded border border-slate-700 bg-slate-950 px-2 py-1" value={r.buy} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, buy: Number(e.target.value) || 0 } : x))} />
            <input className="rounded border border-slate-700 bg-slate-950 px-2 py-1" value={r.current} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, current: Number(e.target.value) || 0 } : x))} />
            <button className="rounded border border-slate-700 px-3" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>Remove</button>
          </div>
        ))}
        <button className="rounded bg-brand px-3 py-2 font-semibold text-black" onClick={() => setRows([...rows, { grams: 0, buy: 0, current: 0 }])}>Add Purchase</button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="card">Total grams: {totals.grams.toFixed(3)}</div>
        <div className="card">Total spent: {totals.spent.toFixed(3)} QAR</div>
        <div className="card">Current value: {totals.value.toFixed(3)} QAR</div>
        <div className="card">Unrealized P/L: {totals.pnl.toFixed(3)} QAR</div>
      </div>
    </main>
  );
}
