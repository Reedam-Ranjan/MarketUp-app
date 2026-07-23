"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DotsIcon } from "@/components/icons";
import { statistics } from "@/lib/mock-data";

function yTick(v: number) {
  return v === 0 ? "0" : `${Math.round(v / 1000)}k`;
}

type TooltipPayload = { value?: number };

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value ?? 0;
  return (
    <div className="rounded-lg bg-[#1f2733] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      {(value / 1000).toFixed(1)}k
    </div>
  );
}

export default function StatisticsChart() {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Statistics</h2>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas">
          <DotsIcon width={18} height={18} />
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={statistics}
            margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="statFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9748f" stopOpacity={0.35} />
                <stop offset="55%" stopColor="#c86dd7" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#c86dd7" stopOpacity={0} />
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
              dy={8}
            />
            <YAxis
              tickFormatter={yTick}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
              width={44}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--color-muted)",
                strokeDasharray: "4 4",
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f9748f"
              strokeWidth={2.5}
              fill="url(#statFill)"
              isAnimationActive={false}
              activeDot={{
                r: 5,
                fill: "#f9748f",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
