import Link from 'next/link';
import { CalculatorRenderer } from '@/components/calculators/CalculatorRenderer';

const descriptions: Record<string, string> = {
  'qar-gold-calculator': 'Convert XAU/USD and USD/QAR into estimated QAR per gram.',
  'gold-premium-calculator': 'Measure local store premium over global spot-derived baseline.',
  'should-i-buy-gold-now': 'Compare current price with your target decision level.',
  'gold-profit-loss-calculator': 'Estimate unrealized P/L for grams held.',
  'making-charge-calculator': 'Estimate final bill after making charge impact.',
  'gold-savings-goal-calculator': 'Calculate months required to hit your gold savings goal.',
};

export default function Page({ params }: { params: { slug: string } }) {
  const description = descriptions[params.slug] ?? 'Gold tool page';

  return (
    <main className="container-page space-y-4">
      <h1 className="text-3xl font-semibold">{params.slug.replaceAll('-', ' ')}</h1>
      <p className="text-slate-300">{description}</p>
      <CalculatorRenderer slug={params.slug} />
      <article className="card">
        <p className="text-slate-300">Want to save results and alerts?</p>
        <Link href="/register" className="mt-2 inline-block rounded bg-brand px-4 py-2 font-semibold text-black">Create free account</Link>
      </article>
    </main>
  );
}
