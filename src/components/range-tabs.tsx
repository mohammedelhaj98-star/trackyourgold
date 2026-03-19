import Link from "next/link";

import { RANGE_OPTIONS, type RangeDays } from "../lib/portfolio";

type RangeTabsProps = {
  currentDays: RangeDays;
  hrefForDays: (days: RangeDays) => string;
};

export function RangeTabs({ currentDays, hrefForDays }: RangeTabsProps) {
  return (
    <div className="range-tabs" role="tablist" aria-label="Range">
      {RANGE_OPTIONS.map((option) => (
        <Link
          key={option.days}
          href={hrefForDays(option.days) as never}
          className={`range-tabs__item ${currentDays === option.days ? "range-tabs__item--active" : ""}`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
