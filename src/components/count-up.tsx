"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "../lib/i18n";

type CountUpProps = {
  value: number;
  locale: Locale;
  mode?: "currency" | "number";
  maximumFractionDigits?: number;
  reduceMotion?: boolean;
  signed?: boolean;
};

function formatValue({
  locale,
  mode,
  signed,
  value,
  maximumFractionDigits
}: Required<Pick<CountUpProps, "locale" | "mode" | "signed" | "value" | "maximumFractionDigits">>) {
  const formatter = new Intl.NumberFormat(locale === "ar" ? "ar-QA" : "en-QA", {
    style: mode === "currency" ? "currency" : "decimal",
    currency: mode === "currency" ? "QAR" : undefined,
    maximumFractionDigits
  });

  if (!signed) {
    return formatter.format(value);
  }

  const absolute = formatter.format(Math.abs(value));
  return value > 0 ? `+${absolute}` : value < 0 ? `-${absolute}` : absolute;
}

export function CountUp({
  value,
  locale,
  mode = "currency",
  maximumFractionDigits = 2,
  reduceMotion = false,
  signed = false
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);
  const previousValue = useRef(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const duration = 520;
    const start = performance.now();
    const from = previousValue.current;

    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (value - from) * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        previousValue.current = value;
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, value]);

  const formatted = useMemo(
    () =>
      formatValue({
        locale,
        mode,
        signed,
        value: displayValue,
        maximumFractionDigits
      }),
    [displayValue, locale, maximumFractionDigits, mode, signed]
  );

  return <>{formatted}</>;
}
