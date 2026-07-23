/**
 * Mock data for the Marketcap dashboard UI. This is placeholder data used to
 * build and preview the frontend; it will be replaced by live market data +
 * the user's Supabase watchlist in a later phase.
 */

export type SummaryStock = {
  symbol: string;
  name: string;
  value: number;
  changePct: number; // signed, e.g. 5.9 or -5.9
};

export type HoldingRow = {
  symbol: string;
  name: string;
  investDate: string;
  volume: string;
  changePct: number;
  price: number;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export const summaryStocks: SummaryStock[] = [
  { symbol: "AAPL", name: "Apple Inc", value: 15238, changePct: 5.9 },
  { symbol: "GOGL", name: "Google Corp", value: 6842, changePct: 5.9 },
  { symbol: "SPOT", name: "Spotify Technology SA", value: 12238, changePct: -5.9 },
  { symbol: "TWTR", name: "Twitter Inc", value: 5820, changePct: 5.4 },
  { symbol: "MSFT", name: "Microsoft Corp", value: 21540, changePct: 3.2 },
  { symbol: "NVDA", name: "NVIDIA Corp", value: 18930, changePct: 8.1 },
];

export const portfolio = {
  total: 17580,
  changePct: 5.9,
  profit: 4790,
};

export const statistics: ChartPoint[] = [
  { label: "Dec 2", value: 38200 },
  { label: "Dec 3", value: 39100 },
  { label: "Dec 4", value: 41800 },
  { label: "Dec 5", value: 40200 },
  { label: "Dec 6", value: 39600 },
  { label: "Dec 7", value: 40100 },
  { label: "Dec 8", value: 43800 },
  { label: "Dec 9", value: 46200 },
];

export const holdings: HoldingRow[] = [
  { symbol: "AAPL", name: "Apple Inc", investDate: "Feb 22, 2024", volume: "7.10B", changePct: 5.9, price: 19.3 },
  { symbol: "TWTR", name: "Twitter Inc", investDate: "Feb 17, 2024", volume: "2.10B", changePct: -2.9, price: 23.3 },
  { symbol: "SPOT", name: "Spotify Technology SA", investDate: "Feb 09, 2024", volume: "4.42B", changePct: 3.4, price: 41.7 },
  { symbol: "GOGL", name: "Google Corp", investDate: "Jan 30, 2024", volume: "9.80B", changePct: 1.8, price: 138.5 },
  { symbol: "NVDA", name: "NVIDIA Corp", investDate: "Jan 18, 2024", volume: "5.06B", changePct: 8.1, price: 61.2 },
];
