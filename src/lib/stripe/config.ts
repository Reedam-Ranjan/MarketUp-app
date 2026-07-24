/** Pricing config for the single paid plan. Client-safe (no secrets). */
export const PRO_PLAN = {
  name: "Marketcap Pro",
  description: "Save unlimited stocks to your watchlist.",
  amount: 2000, // $20.00 in cents
  currency: "usd",
  interval: "month" as const,
  /** Stable key so the price is created once and reused across checkouts. */
  lookupKey: "marketcap_pro_monthly",
};

export const PRO_PLAN_PRICE_LABEL = "$20";
