"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ChangeBadge from "@/components/ChangeBadge";
import NewsList from "@/components/NewsList";
import AddToWatchlistButton from "@/components/AddToWatchlistButton";
import AddToPortfolioButton from "@/components/AddToPortfolioButton";
import PriceChart from "@/components/dashboard/PriceChart";
import { ChevronRightIcon } from "@/components/icons";
import { formatCompactUSD, formatUSD } from "@/lib/format";
import { useNews, useProfile, useQuote } from "@/lib/market/client";
import { NAME_BY_SYMBOL } from "@/lib/watchlist";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export default function StockDetail({
  symbol,
  isPro,
}: {
  symbol: string;
  isPro: boolean;
}) {
  const { data: quote, isError: quoteError } = useQuote(symbol);
  const { data: profile } = useProfile(symbol);
  const {
    data: news = [],
    isLoading: newsLoading,
    isError: newsError,
  } = useNews(symbol);

  const name = profile?.name ?? NAME_BY_SYMBOL[symbol] ?? symbol;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="transition hover:text-ink">
          Dashboard
        </Link>
        <ChevronRightIcon width={14} height={14} />
        <span className="font-medium text-ink-soft">{symbol}</span>
      </nav>

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <BrandLogo symbol={symbol} size="lg" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              {symbol}
            </h1>
            <p className="text-muted">
              {name}
              {profile?.exchange ? ` · ${profile.exchange}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          {quote ? (
            <div className="text-right">
              <p className="text-3xl font-extrabold tracking-tight text-ink">
                {formatUSD(quote.price, 2)}
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <ChangeBadge value={quote.changePct} variant="pill" />
                <span className="text-sm text-muted">
                  {formatUSD(quote.change, 2)} today
                </span>
              </div>
            </div>
          ) : quoteError ? (
            <p className="text-muted">Quote unavailable</p>
          ) : (
            <div className="h-9 w-32 animate-pulse rounded-md bg-canvas" />
          )}
          <div className="flex items-center gap-2">
            <AddToWatchlistButton symbol={symbol} name={name} isPro={isPro} />
            <AddToPortfolioButton
              symbol={symbol}
              isPro={isPro}
              currentPrice={quote?.price}
            />
          </div>
        </div>
      </section>

      {/* Chart + key stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PriceChart symbol={symbol} />
        </div>

        <section className="flex flex-col gap-1 rounded-card border border-line bg-surface p-6">
          <h2 className="mb-2 text-lg font-bold text-ink">Key stats</h2>
          <div className="divide-y divide-line">
            <StatRow
              label="Open"
              value={quote ? formatUSD(quote.open, 2) : "—"}
            />
            <StatRow
              label="Day high"
              value={quote ? formatUSD(quote.high, 2) : "—"}
            />
            <StatRow
              label="Day low"
              value={quote ? formatUSD(quote.low, 2) : "—"}
            />
            <StatRow
              label="Prev close"
              value={quote ? formatUSD(quote.prevClose, 2) : "—"}
            />
            <StatRow
              label="Market cap"
              value={
                profile && profile.marketCap
                  ? formatCompactUSD(profile.marketCap * 1_000_000)
                  : "—"
              }
            />
            <StatRow label="Industry" value={profile?.industry || "—"} />
          </div>
          {profile?.weburl && (
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Visit website
              <ChevronRightIcon width={14} height={14} />
            </a>
          )}
        </section>
      </div>

      {/* News */}
      <section className="rounded-card border border-line bg-surface p-6">
        <h2 className="mb-2 text-lg font-bold text-ink">Latest news</h2>
        <NewsList
          items={news}
          isLoading={newsLoading}
          isError={newsError}
          emptyLabel={`No recent news for ${symbol}.`}
        />
      </section>
    </div>
  );
}
