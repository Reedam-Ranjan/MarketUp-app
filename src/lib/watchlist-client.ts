"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type WatchlistItem = { symbol: string; name: string | null };

/** The signed-in user's saved stocks. */
export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async (): Promise<WatchlistItem[]> => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error("Failed to load watchlist.");
      const data = (await res.json()) as { items: WatchlistItem[] };
      return data.items;
    },
    staleTime: 30_000,
  });
}

/** Error thrown when saving is blocked because the user isn't on the Pro plan. */
export class UpgradeRequiredError extends Error {}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: WatchlistItem) => {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) throw new UpgradeRequiredError(body.error);
      if (!res.ok) throw new Error(body.error ?? "Failed to save stock.");
      return body;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      const res = await fetch(
        `/api/watchlist?symbol=${encodeURIComponent(symbol)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to remove stock.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}
