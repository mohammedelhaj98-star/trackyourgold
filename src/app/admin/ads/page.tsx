import { AdSlotEditor } from "@/components/admin/forms";
import { buildMetadata } from "@/lib/seo";
import { db } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Ad settings",
  description: "Configure reusable ad slots and future AdSense code.",
  path: "/admin/ads",
  noIndex: true
});

export default async function AdminAdsPage() {
  const slots = await db.adSlot.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Ad slots</p>
        <h1 className="font-display text-4xl font-semibold text-white">Reusable ad monetization controls</h1>
        <p className="max-w-4xl text-sm leading-8 text-white/72">Update custom code or AdSense settings here. The runtime slot component lives at <code>src/components/layout/ad-slot.tsx</code>.</p>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        {slots.map((slot) => (
          <AdSlotEditor key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  );
}
