import { recommendationLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function RecommendationBadge({ label }: { label: keyof typeof recommendationLabels | string }) {
  const key = (label in recommendationLabels ? label : "WAIT") as keyof typeof recommendationLabels;
  const config = recommendationLabels[key];
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1", config.tone)}>{config.label}</span>;
}
