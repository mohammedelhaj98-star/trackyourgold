"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatQar } from "@/lib/utils";

type PriceChartFormat = "qar" | "percent-1" | "number-0";

type PriceChartProps = {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  comparisonKey?: string;
  title?: string;
  format?: PriceChartFormat;
};

function formatChartValue(value: number, format: PriceChartFormat) {
  switch (format) {
    case "percent-1":
      return `${value.toFixed(1)}%`;
    case "number-0":
      return `${value.toFixed(0)}`;
    case "qar":
    default:
      return formatQar(value);
  }
}

export function PriceChart({ data, dataKey = "price", comparisonKey, title, format = "qar" }: PriceChartProps) {
  return (
    <div className="h-[340px] w-full">
      {title ? <p className="mb-4 text-sm font-medium text-white/60">{title}</p> : null}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBD96A" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#FBD96A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#43C6BE" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#43C6BE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} width={70} tickFormatter={(value) => formatChartValue(Number(value), format)} />
          <Tooltip
            contentStyle={{
              background: "rgba(7, 11, 20, 0.94)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              color: "white"
            }}
            formatter={(value: number) => formatChartValue(value, format)}
          />
          <Area type="monotone" dataKey={dataKey} stroke="#FBD96A" strokeWidth={2.5} fill="url(#priceGradient)" />
          {comparisonKey ? (
            <Area type="monotone" dataKey={comparisonKey} stroke="#43C6BE" strokeWidth={2} fill="url(#comparisonGradient)" />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
