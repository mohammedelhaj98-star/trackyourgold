import { Button } from "@/components/ui/button";

type DataUnavailableStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function DataUnavailableState({
  eyebrow = "Temporary limitation",
  title,
  description,
  primaryHref = "/",
  primaryLabel = "Return home",
  secondaryHref,
  secondaryLabel
}: DataUnavailableStateProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14 lg:px-8 lg:py-20">
      <div className="rounded-[32px] border border-amber-300/20 bg-amber-300/6 p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-200">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={primaryHref}>{primaryLabel}</Button>
          {secondaryHref && secondaryLabel ? <Button href={secondaryHref} variant="secondary">{secondaryLabel}</Button> : null}
        </div>
      </div>
    </div>
  );
}
