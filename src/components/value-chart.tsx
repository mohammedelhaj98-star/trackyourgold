"use client";

import { useMemo, useState } from "react";

import { formatDate, formatSignedCurrency } from "../lib/format";
import type { Locale } from "../lib/i18n";
import type { ChartPoint } from "../lib/portfolio";

type ValueChartProps = {
  locale: Locale;
  points: ChartPoint[];
  emptyLabel: string;
};

export function ValueChart({ locale, points, emptyLabel }: ValueChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(points.length ? points.length - 1 : null);

  const chart = useMemo(() => {
    if (!points.length) {
      return null;
    }

    const width = 720;
    const height = 220;
    const padding = 20;
    const values = points.map((point) => point.totalValueQar);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const coordinates = points.map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point.totalValueQar - min) / range) * (height - padding * 2);
      return { x, y, point };
    });

    const line = coordinates.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
    const area = `${line} L${coordinates[coordinates.length - 1]?.x ?? 0} ${height - padding} L${coordinates[0]?.x ?? 0} ${height - padding} Z`;

    return {
      width,
      height,
      min,
      max,
      coordinates,
      line,
      area
    };
  }, [points]);

  if (!chart) {
    return <div className="chart-empty">{emptyLabel}</div>;
  }

  const active = chart.coordinates[activeIndex ?? chart.coordinates.length - 1] ?? chart.coordinates[chart.coordinates.length - 1];
  const baseline = chart.coordinates[0]?.point.totalValueQar ?? active.point.totalValueQar;
  const delta = active.point.totalValueQar - baseline;

  return (
    <div className="value-chart">
      <div className="value-chart__summary">
        <strong>{formatDate(active.point.asOf, locale)}</strong>
        <span>{formatSignedCurrency(delta, locale)}</span>
      </div>

      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="value-chart__svg" role="img" aria-label="Value chart">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(240, 202, 131, 0.5)" />
            <stop offset="100%" stopColor="rgba(240, 202, 131, 0.02)" />
          </linearGradient>
        </defs>
        <path d={chart.area} fill="url(#chart-fill)" />
        <path d={chart.line} className="value-chart__line" />
        {chart.coordinates.map(({ x, y, point }, index) => (
          <g
            key={`${point.asOf}-${index}`}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            tabIndex={0}
          >
            <circle className={`value-chart__dot ${index === activeIndex ? "value-chart__dot--active" : ""}`} cx={x} cy={y} r={index === activeIndex ? 5 : 4} />
            <title>
              {formatDate(point.asOf, locale)} - {point.totalValueQar}
            </title>
          </g>
        ))}
      </svg>
    </div>
  );
}
