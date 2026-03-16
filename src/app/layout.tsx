import '@/styles/globals.css';
import type { Metadata } from 'next';
import { MainNav } from '@/components/layout/MainNav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://trackyourgold.com'),
  title: 'TrackYourGold - Gold Price Tracking & Buy Signals',
  description: 'Track Malabar Qatar rates, global spot comparisons, and get informational buy signals.',
  openGraph: {
    title: 'TrackYourGold',
    description: 'Live gold data, smart analysis, and portfolio tools.',
    url: 'https://trackyourgold.com',
    siteName: 'TrackYourGold',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackYourGold',
    description: 'Live gold data and buying insights.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <MainNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
