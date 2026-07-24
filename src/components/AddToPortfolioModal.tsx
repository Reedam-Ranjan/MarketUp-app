"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAddHolding } from "@/lib/portfolio-client";
import { UpgradeRequiredError } from "@/lib/watchlist-client";

function today(): string {
  // Local calendar date (YYYY-MM-DD). Building from UTC via toISOString() would
  // be off by one day in timezones ahead of UTC.
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

export default function AddToPortfolioModal({
  symbol,
  currentPrice,
  onClose,
}: {
  symbol: string;
  currentPrice?: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const add = useAddHolding();
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState(
    currentPrice ? String(Number(currentPrice.toFixed(2))) : "",
  );
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const sharesNum = Number(shares);
    const priceNum = Number(price);
    if (!Number.isFinite(sharesNum) || sharesNum <= 0) {
      setError("Enter a positive number of shares.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid purchase price.");
      return;
    }

    add.mutate(
      {
        symbol,
        shares: sharesNum,
        cost_basis: priceNum,
        purchase_date: date || null,
      },
      {
        onSuccess: () => {
          // Show the "Added to portfolio!" confirmation briefly, then close.
          setAdded(true);
          setTimeout(onClose, 1400);
        },
        onError: (err) => {
          if (err instanceof UpgradeRequiredError) {
            router.push("/pricing");
            return;
          }
          setError(
            err instanceof Error ? err.message : "Could not add to portfolio.",
          );
        },
      },
    );
  }

  const inputClass =
    "w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">
            Add {symbol} to Portfolio
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {added ? (
          <div className="rounded-2xl border border-up/30 bg-up-soft px-4 py-8 text-center">
            <p className="text-lg font-bold text-up">Added to portfolio!</p>
          </div>
        ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">
              Number of shares
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">
              Purchase price per share ($)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-soft">
              Purchase date
            </label>
            <input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-down">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={add.isPending}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {add.isPending ? "Adding…" : "Add to Portfolio"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
