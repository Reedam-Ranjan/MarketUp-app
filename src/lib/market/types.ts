/** Normalized market-data shapes shared across providers and the UI. */

export type Quote = {
  symbol: string;
  price: number;
  change: number; // absolute change on the day
  changePct: number; // signed percent change on the day
  high: number;
  low: number;
  open: number;
  prevClose: number;
  ts: number; // epoch seconds of the quote
};

export type SymbolSearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export type Candle = {
  t: number; // epoch seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // epoch seconds
  image: string;
};

export type CandleRange = "1D" | "1W" | "1M" | "1Y";

export type CompanyProfile = {
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  marketCap: number; // in millions USD (as Finnhub returns it)
  weburl: string;
  logo: string;
  ipo: string;
  country: string;
  currency: string;
};

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;
  getCandles(symbol: string, range: CandleRange): Promise<Candle[]>;
  getCompanyNews(symbol: string): Promise<NewsItem[]>;
  getMarketNews(): Promise<NewsItem[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfile>;
}

/** Thrown by providers so API routes can map to sensible HTTP responses. */
export class MarketDataError extends Error {
  constructor(
    message: string,
    readonly status: number = 502,
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}
