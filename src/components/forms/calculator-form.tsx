"use client";

import { useMemo, useState } from "react";

import type { CalculatorDefinition } from "@/lib/calculators";
import { computeCalculatorResult } from "@/lib/calculators";
import { formatQar } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CalculatorForm({ calculator }: { calculator: CalculatorDefinition }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const result = useMemo(() => {
    const numericValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value || 0)])
    );
    return computeCalculatorResult(calculator.slug, numericValues);
  }, [calculator.slug, values]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 md:grid-cols-2">
        {calculator.inputs.map((input) => (
          <label key={input.key} className="space-y-2 text-sm text-white/70">
            <span>{input.label}</span>
            <input
              type="number"
              step="any"
              placeholder={input.placeholder}
              value={values[input.key] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [input.key]: event.target.value
                }))
              }
              className="w-full rounded-3xl border border-white/12 bg-white/5 px-4 py-4 text-base text-white outline-none transition focus:border-gold-300/45"
            />
          </label>
        ))}
      </div>
      <div className="rounded-[28px] border border-gold-300/20 bg-gold-300/8 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-200">Calculated output</p>
        {result ? (
          <>
            <p className="mt-4 text-sm text-white/60">{result.label}</p>
            <p className="mt-3 font-display text-4xl font-semibold text-white">
              {result.suffix === "%" ? `${Number(result.value).toFixed(2)}%` : formatQar(Number(result.value))}
            </p>
            {"message" in result && result.message ? <p className="mt-4 text-sm leading-7 text-white/70">{result.message}</p> : null}
          </>
        ) : (
          <p className="mt-4 text-sm leading-7 text-white/65">Enter values to generate an instant estimate.</p>
        )}
        <div className="mt-6">
          <Button href="/register" variant="secondary">Create account for saved tools</Button>
        </div>
      </div>
    </div>
  );
}
