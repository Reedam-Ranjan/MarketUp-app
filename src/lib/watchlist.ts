/**
 * The default set of symbols shown on the dashboard. Client-safe (no secrets).
 * Later this will be replaced by the signed-in user's Supabase watchlist.
 * Uses real, liquid tickers so Finnhub returns live quotes.
 */
export type WatchSymbol = { symbol: string; name: string };

export const DEFAULT_WATCHLIST: WatchSymbol[] = [
  { symbol: "AAPL", name: "Apple Inc" },
  { symbol: "GOOGL", name: "Alphabet Inc" },
  { symbol: "MSFT", name: "Microsoft Corp" },
  { symbol: "AMZN", name: "Amazon.com Inc" },
  { symbol: "NVDA", name: "NVIDIA Corp" },
  { symbol: "SPOT", name: "Spotify Technology SA" },
  { symbol: "TSLA", name: "Tesla Inc" },
  { symbol: "META", name: "Meta Platforms Inc" },
];

export const NAME_BY_SYMBOL: Record<string, string> = Object.fromEntries(
  DEFAULT_WATCHLIST.map((w) => [w.symbol, w.name]),
);
