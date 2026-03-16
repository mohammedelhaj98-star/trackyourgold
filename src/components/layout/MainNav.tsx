import Link from 'next/link';

export function MainNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80">
      <nav className="container-page flex items-center justify-between py-4">
        <Link href="/" className="font-semibold text-brand">TrackYourGold</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/gold/qatar">Prices</Link>
          <Link href="/history/qatar">History</Link>
          <Link href="/learn-about-gold">Gold Insights</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
