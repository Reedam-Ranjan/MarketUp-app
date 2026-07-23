"use client";

import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ChangeBadge from "@/components/ChangeBadge";
import { SortIcon } from "@/components/icons";
import { formatUSD } from "@/lib/format";
import { useQuotes } from "@/lib/market/client";
import type { WatchSymbol } from "@/lib/watchlist";

const COLUMNS = [
  { key: "name", label: "Name Stock", align: "left" },
  { key: "open", label: "Open", align: "left" },
  { key: "prevClose", label: "Prev Close", align: "left" },
  { key: "change", label: "Change", align: "left" },
  { key: "price", label: "Price/stock", align: "right" },
] as const;

export default function MyStockTable({
  watchlist,
}: {
  watchlist: WatchSymbol[];
}) {
  const router = useRouter();
  const symbols = watchlist.map((w) => w.symbol);
  const { bySymbol, isLoading } = useQuotes(symbols);

  return (
    <section className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6">
      <h2 className="text-lg font-bold text-ink">My Stock</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`pb-3 text-sm font-semibold text-muted ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${
                      c.align === "right" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {c.label}
                    <SortIcon width={14} height={14} className="text-muted" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {watchlist.map((w) => {
              const q = bySymbol.get(w.symbol);
              return (
                <tr
                  key={w.symbol}
                  onClick={() => router.push(`/stock/${w.symbol}`)}
                  className="cursor-pointer border-b border-line last:border-0 transition hover:bg-canvas/60"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <BrandLogo symbol={w.symbol} size="sm" />
                      <div>
                        <p className="font-semibold text-ink">{w.symbol}</p>
                        <p className="text-sm text-muted">{w.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-ink-soft">
                    {q ? formatUSD(q.open, 2) : isLoading ? "…" : "—"}
                  </td>
                  <td className="py-4 text-ink-soft">
                    {q ? formatUSD(q.prevClose, 2) : isLoading ? "…" : "—"}
                  </td>
                  <td className="py-4">
                    {q ? (
                      <ChangeBadge value={q.changePct} variant="pill" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-4 text-right font-semibold text-ink">
                    {q ? formatUSD(q.price, 2) : isLoading ? "…" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
