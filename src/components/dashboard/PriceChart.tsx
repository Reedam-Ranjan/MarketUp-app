"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCandles, type CandleRange } from "@/lib/market/client";
import { formatUSD } from "@/lib/format";

const RANGES: CandleRange[] = ["1D", "1W", "1M", "1Y"];

type Point = { t: number; price: number; label: string };

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Point }[];
}) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-lg bg-[#1f2733] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      <span className="block">{formatUSD(p.price, 2)}</span>
      <span className="block font-normal text-white/70">{p.label}</span>
    </div>
  );
}

export default function PriceChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<CandleRange>("1M");
  const { data: candles, isLoading, isError, error } = useCandles(symbol, range);

  const points: Point[] = (candles ?? []).map((c) => ({
    t: c.t,
    price: c.c,
    label: new Date(c.t * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: range === "1Y" ? "2-digit" : undefined,
    }),
  }));

  const up =
    points.length > 1
      ? points[points.length - 1].price >= points[0].price
      : true;
  const color = up ? "#17a55a" : "#ef4444";

  return (
    <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Price history</h2>
        <div className="flex gap-1 rounded-full bg-canvas p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                range === r
                  ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                  : "text-muted hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        {isLoading ? (
          <div className="grid h-full place-items-center text-sm text-muted">
            Loading chart…
          </div>
        ) : isError || points.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-muted">
            {error instanceof Error ? error.message : "No chart data available."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 6"
                stroke="var(--color-line-strong)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                minTickGap={40}
                dy={8}
              />
              <YAxis
                tickFormatter={(v: number) => `$${Math.round(v)}`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                domain={["auto", "auto"]}
                width={56}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--color-muted)",
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2.5}
                fill="url(#priceFill)"
                isAnimationActive={false}
                activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
