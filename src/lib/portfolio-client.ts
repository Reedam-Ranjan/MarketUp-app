"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpgradeRequiredError } from "@/lib/watchlist-client";

export type Holding = {
  id: string;
  symbol: string;
  shares: number;
  cost_basis: number;
  purchase_date: string | null;
};

export type NewHolding = {
  symbol: string;
  shares: number;
  cost_basis: number;
  purchase_date: string | null;
};

/** The signed-in user's portfolio holdings. */
export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async (): Promise<Holding[]> => {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to load portfolio.");
      const data = (await res.json()) as { items: Holding[] };
      return data.items;
    },
    staleTime: 30_000,
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holding: NewHolding) => {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) throw new UpgradeRequiredError(body.error);
      if (!res.ok) throw new Error(body.error ?? "Failed to add holding.");
      return body;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

export function useRemoveHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/portfolio?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to remove holding.");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}
