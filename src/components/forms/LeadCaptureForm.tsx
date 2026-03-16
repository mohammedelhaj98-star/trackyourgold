'use client';

import { useState } from 'react';

export function LeadCaptureForm({ sourcePage }: { sourcePage: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sourcePage }),
    });
    setStatus(res.ok ? 'Subscribed' : 'Could not subscribe');
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2" />
      <button className="w-full rounded bg-brand px-3 py-2 font-semibold text-black">Subscribe</button>
      {status && <p className="text-xs text-slate-300">{status}</p>}
    </form>
  );
}
