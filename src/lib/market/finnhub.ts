import "server-only";
import { cached } from "./cache";
import {
  MarketDataError,
  type CompanyProfile,
  type NewsItem,
  type Quote,
  type SymbolSearchResult,
} from "./types";

const BASE = "https://finnhub.io/api/v1";

function apiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new MarketDataError(
      "FINNHUB_API_KEY is not set. Add it to .env.local and restart the dev server.",
      500,
    );
  }
  return key;
}

async function finnhubGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", apiKey());

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new MarketDataError("Could not reach the market data service.", 502);
  }

  if (res.status === 429) {
    throw new MarketDataError("Rate limit reached. Try again shortly.", 429);
  }
  if (res.status === 401 || res.status === 403) {
    throw new MarketDataError("Market data API key is invalid.", 502);
  }
  if (!res.ok) {
    throw new MarketDataError(`Market data request failed (${res.status}).`, 502);
  }
  return (await res.json()) as T;
}

type RawQuote = {
  c: number; // current
  d: number | null; // change
  dp: number | null; // percent change
  h: number;
  l: number;
  o: number;
  pc: number; // previous close
  t: number;
};

export async function getQuote(symbol: string): Promise<Quote> {
  const sym = symbol.toUpperCase();
  return cached(`quote:${sym}`, 15_000, async () => {
    const raw = await finnhubGet<RawQuote>("/quote", { symbol: sym });
    // Finnhub returns all-zero for unknown symbols.
    if (!raw || raw.c === 0) {
      throw new MarketDataError(`No quote available for ${sym}.`, 404);
    }
    return {
      symbol: sym,
      price: raw.c,
      change: raw.d ?? 0,
      changePct: raw.dp ?? 0,
      high: raw.h,
      low: raw.l,
      open: raw.o,
      prevClose: raw.pc,
      ts: raw.t,
    } satisfies Quote;
  });
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  // Resolve individually (each is cached) but tolerate partial failures so one
  // bad ticker doesn't blank the whole dashboard.
  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));
  return results
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function searchSymbols(
  query: string,
): Promise<SymbolSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  return cached(`search:${q.toLowerCase()}`, 60_000, async () => {
    const raw = await finnhubGet<{ result?: SymbolSearchResult[] }>("/search", {
      q,
    });
    return (raw.result ?? [])
      .filter((r) => r.type === "Common Stock" || r.type === "")
      .slice(0, 12);
  });
}

type RawNews = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image: string;
};

function mapNews(raw: RawNews[]): NewsItem[] {
  return raw
    .filter((n) => n.headline && n.url)
    .slice(0, 20)
    .map((n) => ({
      id: String(n.id),
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      datetime: n.datetime,
      image: n.image,
    }));
}

export async function getMarketNews(): Promise<NewsItem[]> {
  return cached("news:market", 5 * 60_000, async () => {
    const raw = await finnhubGet<RawNews[]>("/news", { category: "general" });
    return mapNews(raw);
  });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type RawProfile = {
  name?: string;
  ticker?: string;
  exchange?: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
  weburl?: string;
  logo?: string;
  ipo?: string;
  country?: string;
  currency?: string;
};

export async function getCompanyProfile(
  symbol: string,
): Promise<CompanyProfile> {
  const sym = symbol.toUpperCase();
  return cached(`profile:${sym}`, 24 * 60 * 60_000, async () => {
    const raw = await finnhubGet<RawProfile>("/stock/profile2", {
      symbol: sym,
    });
    if (!raw || !raw.name) {
      throw new MarketDataError(`No company profile for ${sym}.`, 404);
    }
    return {
      symbol: sym,
      name: raw.name,
      exchange: raw.exchange ?? "",
      industry: raw.finnhubIndustry ?? "",
      marketCap: raw.marketCapitalization ?? 0,
      weburl: raw.weburl ?? "",
      logo: raw.logo ?? "",
      ipo: raw.ipo ?? "",
      country: raw.country ?? "",
      currency: raw.currency ?? "USD",
    } satisfies CompanyProfile;
  });
}

export async function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  const sym = symbol.toUpperCase();
  return cached(`news:${sym}`, 5 * 60_000, async () => {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    const raw = await finnhubGet<RawNews[]>("/company-news", {
      symbol: sym,
      from: isoDate(from),
      to: isoDate(to),
    });
    return mapNews(raw);
  });
}
