"use client";

import Link from "next/link";
import StockSummaryCards from "@/components/dashboard/StockSummaryCards";
import MyStockTable from "@/components/dashboard/MyStockTable";
import { StockIcon } from "@/components/icons";
import { useWatchlist } from "@/lib/watchlist-client";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
        <StockIcon width={22} height={22} />
      </span>
      <p className="text-lg font-semibold text-ink">No stocks yet</p>
      <p className="max-w-sm text-sm text-muted">
        Open a stock and tap{" "}
        <span className="font-medium text-ink-soft">Watchlist</span> to save it
        here. Browse the market on the{" "}
        <Link href="/" className="font-medium text-brand hover:underline">
          Overview
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

export default function MyStockView() {
  const { data: watchlist = [], isLoading } = useWatchlist();

  if (isLoading) {
    return (
      <div className="rounded-card border border-line bg-surface p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-line-strong" />
      </div>
    );
  }

  if (watchlist.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <StockSummaryCards items={watchlist} />
      <MyStockTable items={watchlist} showRemove />
    </>
  );
}
