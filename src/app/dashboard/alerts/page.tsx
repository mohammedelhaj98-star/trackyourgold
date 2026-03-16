'use client';

import { useState } from 'react';

export default function AlertsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [threshold, setThreshold] = useState(1.5);

  return (
    <main className="container-page space-y-4">
      <h1 className="text-3xl font-semibold">Alert Settings</h1>
      <div className="card space-y-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} /> Email alerts enabled</label>
        <label className="block">Price drop threshold (%)
          <input className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 0)} />
        </label>
        <p className="text-slate-300">This UI maps to `alert_rules` and supports deduplication and weekly summaries.</p>
      </div>
    </main>
  );
}
