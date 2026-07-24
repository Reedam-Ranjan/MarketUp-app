import "server-only";
import * as finnhub from "./finnhub";
import * as twelvedata from "./twelvedata";
import type { MarketDataProvider } from "./types";

/**
 * The default market-data provider used by the API routes. Composes Finnhub
 * (quotes / search / news / profile) with Twelve Data (historical + intraday
 * candles). Everything sits behind the MarketDataProvider interface so a paid
 * real-time provider can be dropped in later without touching routes or UI.
 */
export const marketData: MarketDataProvider = {
  getQuote: finnhub.getQuote,
  getQuotes: finnhub.getQuotes,
  searchSymbols: finnhub.searchSymbols,
  getCompanyNews: finnhub.getCompanyNews,
  getMarketNews: finnhub.getMarketNews,
  getCompanyProfile: finnhub.getCompanyProfile,
  getCandles: twelvedata.getCandles,
};

export * from "./types";
