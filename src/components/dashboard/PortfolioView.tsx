"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ChangeBadge from "@/components/ChangeBadge";
import { ChevronRightIcon, PortfolioIcon } from "@/components/icons";
import { formatUSD } from "@/lib/format";
import { useQuotes } from "@/lib/market/client";
import { usePortfolio, useRemoveHolding } from "@/lib/portfolio-client";

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const parsed = new Date(`${d}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
        <PortfolioIcon width={22} height={22} />
      </span>
      <p className="text-lg font-semibold text-ink">No holdings yet</p>
      <p className="max-w-sm text-sm text-muted">
        Open a stock and use{" "}
        <span className="font-medium text-ink-soft">Add to Portfolio</span> to
        record the shares you own. They&apos;ll show up here with live value and
        gain/loss.
      </p>
    </div>
  );
}

export default function PortfolioView() {
  const { data: holdings = [], isLoading } = usePortfolio();
  const remove = useRemoveHolding();
  const symbols = holdings.map((h) => h.symbol);
  const { bySymbol } = useQuotes(symbols);

  if (!isLoading && holdings.length === 0) {
    return <EmptyState />;
  }

  // Totals across all holdings that have a live quote.
  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const q = bySymbol.get(h.symbol);
    totalCost += h.shares * h.cost_basis;
    if (q) totalValue += h.shares * q.price;
  }
  const totalGain = totalValue - totalCost;
  const returnPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Value">
          <span className="text-3xl font-extrabold tracking-tight text-ink">
            {formatUSD(totalValue, 2)}
          </span>
        </StatCard>
        <StatCard label="Total Cost">
          <span className="text-3xl font-extrabold tracking-tight text-ink">
            {formatUSD(totalCost, 2)}
          </span>
        </StatCard>
        <StatCard label="Total Gain / Loss">
          <span
            className={`text-3xl font-extrabold tracking-tight ${
              totalGain >= 0 ? "text-up" : "text-down"
            }`}
          >
            {totalGain >= 0 ? "" : "-"}
            {formatUSD(Math.abs(totalGain), 2)}
          </span>
        </StatCard>
        <StatCard label="Return">
          <ChangeBadge value={returnPct} variant="pill" className="self-start" />
        </StatCard>
      </div>

      {/* Holdings table */}
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-line text-left">
              {[
                "Stock",
                "Shares",
                "Avg Cost",
                "Current Price",
                "Current Value",
                "Gain / Loss",
                "Today",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-sm font-semibold text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const q = bySymbol.get(h.symbol);
              const value = q ? h.shares * q.price : null;
              const cost = h.shares * h.cost_basis;
              const gain = value !== null ? value - cost : null;
              const gainPct =
                gain !== null && cost > 0 ? (gain / cost) * 100 : null;
              return (
                <tr
                  key={h.id}
                  className="border-b border-line last:border-0 transition hover:bg-canvas/60"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <BrandLogo symbol={h.symbol} size="sm" />
                      <div>
                        <p className="font-semibold text-ink">{h.symbol}</p>
                        <p className="text-xs text-muted">
                          {formatDate(h.purchase_date)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{h.shares}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {formatUSD(h.cost_basis, 2)}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {q ? formatUSD(q.price, 2) : "…"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">
                    {value !== null ? formatUSD(value, 2) : "…"}
                  </td>
                  <td className="px-5 py-4">
                    {gain !== null ? (
                      <span
                        className={`font-semibold ${
                          gain >= 0 ? "text-up" : "text-down"
                        }`}
                      >
                        {gain >= 0 ? "" : "-"}
                        {formatUSD(Math.abs(gain), 2)}
                        {gainPct !== null && (
                          <span className="ml-1 text-xs font-normal">
                            ({gainPct >= 0 ? "+" : ""}
                            {gainPct.toFixed(2)}%)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {q ? (
                      <ChangeBadge value={q.changePct} variant="pill" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => remove.mutate(h.id)}
                        disabled={remove.isPending}
                        title="Remove holding"
                        className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-down-soft hover:text-down disabled:opacity-60"
                      >
                        Remove
                      </button>
                      <Link
                        href={`/stock/${h.symbol}`}
                        title="Open stock"
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-brand"
                      >
                        <ChevronRightIcon width={18} height={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
