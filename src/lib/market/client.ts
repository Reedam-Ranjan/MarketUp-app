"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Candle,
  CandleRange,
  CompanyProfile,
  NewsItem,
  Quote,
} from "./types";

/** Client-safe re-exports so components don't import server modules. */
export type { Quote, Candle, CandleRange, CompanyProfile, NewsItem } from "./types";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Request failed.");
  }
  return (await res.json()) as T;
}

/**
 * Live quotes for a list of symbols, polled every 20s. Returns a map keyed by
 * symbol plus the underlying query state.
 */
export function useQuotes(symbols: string[]) {
  const key = [...symbols].sort();
  const query = useQuery({
    queryKey: ["quotes", key],
    queryFn: () =>
      fetchJson<{ quotes: Quote[] }>(
        `/api/quote?symbols=${symbols.join(",")}`,
      ).then((d) => d.quotes),
    refetchInterval: 20_000,
    enabled: symbols.length > 0,
  });

  const bySymbol = new Map<string, Quote>(
    (query.data ?? []).map((q) => [q.symbol, q]),
  );

  return { ...query, bySymbol };
}

/** Live quote for a single symbol, polled every 20s. */
export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () =>
      fetchJson<{ quote: Quote }>(`/api/quote?symbol=${symbol}`).then(
        (d) => d.quote,
      ),
    refetchInterval: 20_000,
    enabled: !!symbol,
  });
}

/** Historical candles for a symbol + range (charts). */
export function useCandles(symbol: string, range: CandleRange) {
  return useQuery({
    queryKey: ["candles", symbol, range],
    queryFn: () =>
      fetchJson<{ candles: Candle[] }>(
        `/api/candles?symbol=${symbol}&range=${range}`,
      ).then((d) => d.candles),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}

/** Company profile (name, industry, market cap, …). */
export function useProfile(symbol: string) {
  return useQuery({
    queryKey: ["profile", symbol],
    queryFn: () =>
      fetchJson<{ profile: CompanyProfile }>(
        `/api/profile?symbol=${symbol}`,
      ).then((d) => d.profile),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60_000,
  });
}

/** News — company-specific when `symbol` is given, otherwise general market. */
export function useNews(symbol?: string) {
  return useQuery({
    queryKey: ["news", symbol ?? "market"],
    queryFn: () =>
      fetchJson<{ news: NewsItem[] }>(
        symbol ? `/api/news?symbol=${symbol}` : `/api/news`,
      ).then((d) => d.news),
    staleTime: 5 * 60_000,
  });
}
