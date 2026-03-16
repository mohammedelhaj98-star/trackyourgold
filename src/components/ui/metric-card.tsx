import type { ReactNode } from "react";

import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, detail, accent, footer }: { label: string; value: string; detail?: string; accent?: string; footer?: ReactNode; }) {
  return (
    <Panel className={cn("space-y-3", accent)}>
      <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="font-display text-3xl font-semibold text-white">{value}</p>
      {detail ? <p className="text-sm text-white/65">{detail}</p> : null}
      {footer}
    </Panel>
  );
}
