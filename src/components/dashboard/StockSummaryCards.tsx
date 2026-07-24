"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ChangeBadge from "@/components/ChangeBadge";
import { formatUSD } from "@/lib/format";
import { useQuotes } from "@/lib/market/client";

export type StockItem = { symbol: string; name?: string | null };

export default function StockSummaryCards({ items }: { items: StockItem[] }) {
  const symbols = items.map((w) => w.symbol);
  const { bySymbol, isLoading } = useQuotes(symbols);

  if (items.length === 0) return null;

  return (
    <div className="rail-scroll flex gap-4 overflow-x-auto pb-1">
      {items.map((w) => {
        const quote = bySymbol.get(w.symbol);
        return (
          <Link
            key={w.symbol}
            href={`/stock/${w.symbol}`}
            className="flex w-72 shrink-0 flex-col gap-4 rounded-card border border-line bg-surface p-5 transition hover:border-line-strong hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <BrandLogo symbol={w.symbol} size="md" />
              <div className="min-w-0">
                <p className="font-bold leading-tight text-ink">{w.symbol}</p>
                <p className="truncate text-sm text-muted">
                  {w.name ?? w.symbol}
                </p>
              </div>
            </div>

            <div>
              {quote ? (
                <>
                  <p className="text-2xl font-extrabold tracking-tight text-ink">
                    {formatUSD(quote.price, 2)}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <ChangeBadge value={quote.changePct} />
                    <span className="text-sm text-muted">today</span>
                  </div>
                </>
              ) : isLoading ? (
                <>
                  <div className="h-8 w-32 animate-pulse rounded-md bg-line-strong" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-line" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-extrabold tracking-tight text-muted">
                    —
                  </p>
                  <p className="mt-1 text-sm text-muted">Unavailable</p>
                </>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
