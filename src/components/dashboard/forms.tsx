import { createAlertRuleAction, createPurchaseAction, saveAnalysisAction, toggleAdsSuppressionAction } from "@/server/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function PurchaseForm() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Add purchase</h3>
      <form action={createPurchaseAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="countrySlug" value="qatar" />
        <input name="storeName" placeholder="Store name" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="karatLabel" placeholder="22K" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="grams" type="number" step="any" placeholder="18.5" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="pricePerGram" type="number" step="any" placeholder="279.4" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="totalPaid" type="number" step="any" placeholder="5168.9" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="makingCharge" type="number" step="any" placeholder="92" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="purchasedAt" type="date" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="notes" placeholder="Notes" className="min-h-32 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white md:col-span-2" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Save purchase</Button>
      </form>
    </Panel>
  );
}

export function AlertRuleForm() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Create alert rule</h3>
      <form action={createAlertRuleAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="countrySlug" value="qatar" />
        <select name="type" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white">
          <option value="PRICE_DROP">Price drop</option>
          <option value="NEW_90_DAY_LOW">New 90-day low</option>
          <option value="WEEKLY_SUMMARY">Weekly summary</option>
        </select>
        <input name="karatLabel" placeholder="22K" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="percentThreshold" type="number" step="0.1" placeholder="1.5" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="comparisonDays" type="number" placeholder="1" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="summaryFrequency" placeholder="weekly" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <input name="cooldownMinutes" type="number" placeholder="720" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <Button type="submit" className="md:col-span-2 md:w-fit">Save alert rule</Button>
      </form>
    </Panel>
  );
}

export function SavedAnalysisForm() {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Save an analysis note</h3>
      <form action={saveAnalysisAction} className="mt-5 grid gap-4">
        <input type="hidden" name="countrySlug" value="qatar" />
        <input name="karatLabel" placeholder="22K" className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <textarea name="note" placeholder="What are you waiting for before buying?" className="min-h-32 rounded-[24px] border border-white/12 bg-white/5 px-4 py-3 text-white" />
        <Button type="submit" className="w-fit">Save note</Button>
      </form>
    </Panel>
  );
}

export function AdsPreferenceForm({ adsSuppressed }: { adsSuppressed: boolean }) {
  return (
    <Panel>
      <h3 className="font-display text-2xl font-semibold text-white">Display settings</h3>
      <p className="mt-3 text-sm leading-7 text-white/65">TrackYourGold currently hides ads for all signed-in users. This preference is still stored so future segmentation rules can honor user-level suppression immediately if the monetization policy changes.</p>
      <form action={toggleAdsSuppressionAction} className="mt-5 flex items-center gap-4">
        <input type="hidden" name="adsSuppressed" value={String(!adsSuppressed)} />
        <Button type="submit" variant="secondary">{adsSuppressed ? "Allow future ad experiments" : "Keep ads suppressed"}</Button>
      </form>
    </Panel>
  );
}

