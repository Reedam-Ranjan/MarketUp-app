"use client";

import { useRouter } from "next/navigation";
import { BookmarkIcon, BookmarkFilledIcon } from "@/components/icons";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  UpgradeRequiredError,
} from "@/lib/watchlist-client";

export default function AddToWatchlistButton({
  symbol,
  name,
  isPro,
}: {
  symbol: string;
  name: string;
  isPro: boolean;
}) {
  const router = useRouter();
  const { data: watchlist = [] } = useWatchlist();
  const add = useAddToWatchlist();
  const remove = useRemoveFromWatchlist();

  const saved = watchlist.some((w) => w.symbol === symbol);

  // Free users see the same "Add to watchlist" affordance, but clicking it
  // sends them to the pricing page to choose a plan and upgrade (saving is
  // Pro-only).
  if (!isPro) {
    return (
      <button
        onClick={() => router.push("/pricing")}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        <BookmarkIcon width={16} height={16} />
        Add to watchlist
      </button>
    );
  }

  if (saved) {
    return (
      <button
        onClick={() => remove.mutate(symbol)}
        disabled={remove.isPending}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-60"
      >
        <BookmarkFilledIcon width={16} height={16} className="text-brand" />
        Saved
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        add.mutate(
          { symbol, name },
          {
            onError: (err) => {
              if (err instanceof UpgradeRequiredError) router.push("/pricing");
            },
          },
        );
      }}
      disabled={add.isPending}
      className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      <BookmarkIcon width={16} height={16} />
      {add.isPending ? "Saving…" : "Add to watchlist"}
    </button>
  );
}
