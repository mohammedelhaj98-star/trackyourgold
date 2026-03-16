import { getAdSlotConfig } from '@/lib/config/appConfig';

export function AdSlot({ slotKey, isAuthenticated = false }: { slotKey: string; isAuthenticated?: boolean }) {
  const slot = getAdSlotConfig(slotKey);
  if (!slot || !slot.enabled || isAuthenticated) return null;

  if (slot.placeholderMode) {
    return <div className="card text-center text-xs text-slate-400">Ad Slot: {slot.title}</div>;
  }

  return <div className="card" dangerouslySetInnerHTML={{ __html: slot.customCode || '' }} />;
}
