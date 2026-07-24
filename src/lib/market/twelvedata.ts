import "server-only";
import { cached } from "./cache";
import { MarketDataError, type Candle, type CandleRange } from "./types";

/**
 * Historical + intraday candles from Twelve Data (free tier: 800 req/day).
 * Chosen because the keyless options are unavailable server-side: Finnhub
 * gates candles behind its paid plan, Stooq now serves a JS bot-challenge, and
 * Yahoo hard-rate-limits datacenter IPs. Set TWELVE_DATA_API_KEY in .env.local;
 * without it we fall back to the "demo" key, which only returns data for AAPL.
 */

const RANGE_PARAMS: Record<
  CandleRange,
  { interval: string; outputsize: number }
> = {
  "1D": { interval: "5min", outputsize: 78 }, // ~one trading session
  "1W": { interval: "30min", outputsize: 80 },
  "1M": { interval: "1day", outputsize: 22 },
  "1Y": { interval: "1day", outputsize: 252 },
};

function apiKey(): string {
  return process.env.TWELVE_DATA_API_KEY || "demo";
}

type TDResponse = {
  status?: string;
  code?: number;
  message?: string;
  values?: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume?: string;
  }>;
};

function toEpoch(datetime: string): number {
  // Daily is "YYYY-MM-DD"; intraday is "YYYY-MM-DD HH:MM:SS".
  const iso =
    datetime.length <= 10
      ? `${datetime}T00:00:00Z`
      : datetime.replace(" ", "T");
  return Math.floor(new Date(iso).getTime() / 1000);
}

export async function getCandles(
  symbol: string,
  range: CandleRange,
): Promise<Candle[]> {
  const sym = symbol.toUpperCase();
  return cached(`candles:${sym}:${range}`, 5 * 60_000, async () => {
    const { interval, outputsize } = RANGE_PARAMS[range];
    const url =
      `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}` +
      `&interval=${interval}&outputsize=${outputsize}&order=ASC&apikey=${apiKey()}`;

    let res: Response;
    try {
      res = await fetch(url, { cache: "no-store" });
    } catch {
      throw new MarketDataError("Could not reach the chart data service.", 502);
    }
    if (!res.ok) {
      throw new MarketDataError(`Chart data request failed (${res.status}).`, 502);
    }

    const json = (await res.json()) as TDResponse;

    if (json.status === "error" || !json.values) {
      const msg = json.message ?? "";
      if (/api key/i.test(msg)) {
        throw new MarketDataError(
          "Add a free Twelve Data API key (TWELVE_DATA_API_KEY) to enable charts for all symbols.",
          502,
        );
      }
      if (json.code === 429) {
        throw new MarketDataError(
          "Chart data is rate-limited right now. Please try again shortly.",
          429,
        );
      }
      throw new MarketDataError(`No chart data available for ${sym}.`, 404);
    }

    const candles: Candle[] = json.values
      .map((v) => ({
        t: toEpoch(v.datetime),
        o: Number(v.open),
        h: Number(v.high),
        l: Number(v.low),
        c: Number(v.close),
        v: Number(v.volume ?? 0),
      }))
      .filter((c) => Number.isFinite(c.c) && c.c > 0);

    if (candles.length === 0) {
      throw new MarketDataError(`No chart data available for ${sym}.`, 404);
    }
    return candles;
  });
}
