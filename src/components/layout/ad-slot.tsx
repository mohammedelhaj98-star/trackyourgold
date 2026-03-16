import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { shouldShowAds } from "@/lib/ads";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/ui/panel";

export async function AdSlot({ slotKey, className }: { slotKey: string; className?: string }) {
  const [user, slot] = await Promise.all([
    getCurrentUser(),
    db.adSlot.findUnique({ where: { key: slotKey } })
  ]);

  if (!slot || !slot.isEnabled || !shouldShowAds(user)) {
    return <div className={cn("hidden", className)} aria-hidden="true" />;
  }

  if (slot.placeholderMode || !slot.customCode) {
    return (
      <Panel className={cn("flex min-h-[280px] flex-col justify-between border-dashed border-gold-300/30 bg-gold-300/6", className)}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Sponsored placement</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">{slot.placeholderTitle ?? slot.name}</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">{slot.placeholderDescription ?? "AdSense or custom ad code can be added from the admin panel."}</p>
        </div>
        <p className="text-xs text-white/40">Ad slot key: {slot.key}</p>
      </Panel>
    );
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: slot.customCode }} />;
}
