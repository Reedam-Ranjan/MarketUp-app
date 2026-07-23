import "server-only";
import { cached } from "./cache";
import { MarketDataError, type Candle, type CandleRange } from "./types";

/**
 * Historical + intraday candles from Yahoo Finance's public chart endpoint
 * (free, no API key). Chosen because Finnhub moved candles to its paid plan and
 * Stooq now gates its CSV behind a JS anti-bot challenge. Unofficial API, so we
 * keep it behind the MarketDataProvider interface for easy replacement.
 */

const RANGE_PARAMS: Record<CandleRange, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "30m" },
  "1M": { range: "1mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
};

type YahooChart = {
  chart: {
    result?: Array<{
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
};

// Yahoo load-balances across these hosts; if one throttles, the other may not.
const HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

const HEADERS = {
  // Yahoo rejects requests without a browser-like User-Agent.
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  Accept: "application/json",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetches the chart JSON, trying both hosts and retrying once on 429. */
async function fetchChart(path: string): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const host of HOSTS) {
      try {
        const res = await fetch(`${host}${path}`, {
          cache: "no-store",
          headers: HEADERS,
        });
        if (res.ok) return res;
        last = res;
      } catch {
        // network error — try the next host
      }
    }
    if (attempt === 0) await sleep(400); // brief backoff before the second pass
  }
  if (last?.status === 429) {
    throw new MarketDataError(
      "Chart data is rate-limited right now. Please try again shortly.",
      429,
    );
  }
  throw new MarketDataError(
    `Chart data request failed${last ? ` (${last.status})` : ""}.`,
    502,
  );
}

export async function getCandles(
  symbol: string,
  range: CandleRange,
): Promise<Candle[]> {
  const sym = symbol.toUpperCase();
  return cached(`candles:${sym}:${range}`, 5 * 60_000, async () => {
    const { range: r, interval } = RANGE_PARAMS[range];
    const path = `/v8/finance/chart/${encodeURIComponent(
      sym,
    )}?range=${r}&interval=${interval}`;

    const res = await fetchChart(path);
    const json = (await res.json()) as YahooChart;
    const result = json.chart.result?.[0];
    const q = result?.indicators.quote[0];
    const ts = result?.timestamp;

    if (!result || !ts || !q?.close) {
      throw new MarketDataError(`No chart data available for ${sym}.`, 404);
    }

    const candles: Candle[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = q.close[i];
      if (c == null) continue; // skip gaps (e.g. pre-market nulls)
      candles.push({
        t: ts[i],
        o: q.open?.[i] ?? c,
        h: q.high?.[i] ?? c,
        l: q.low?.[i] ?? c,
        c,
        v: q.volume?.[i] ?? 0,
      });
    }

    if (candles.length === 0) {
      throw new MarketDataError(`No chart data available for ${sym}.`, 404);
    }
    return candles;
  });
}
