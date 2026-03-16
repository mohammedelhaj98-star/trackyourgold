import { Panel } from "@/components/ui/panel";

export function FinancialDisclaimer() {
  return (
    <Panel className="border-amber-300/15 bg-amber-500/8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Financial disclaimer</p>
      <p className="mt-3 text-sm leading-7 text-amber-50/80">
        TrackYourGold provides informational analysis based on tracked pricing, historical patterns, and spot-derived comparisons. It does not guarantee outcomes and should not be treated as certain investment advice.
      </p>
    </Panel>
  );
}
