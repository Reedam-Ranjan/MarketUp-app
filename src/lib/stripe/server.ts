import "server-only";
import Stripe from "stripe";
import { PRO_PLAN } from "./config";

let _stripe: Stripe | null = null;

/** Lazily-constructed Stripe client (test-mode secret key). */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local and restart.",
      );
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/**
 * Returns the recurring price ID for the Pro plan, creating the product +
 * price on first use (keyed by lookup_key so it's reused afterwards). An
 * explicit STRIPE_PRICE_ID env var, if set, always wins.
 */
export async function getOrCreateProPriceId(): Promise<string> {
  if (process.env.STRIPE_PRICE_ID) return process.env.STRIPE_PRICE_ID;

  const stripe = getStripe();

  const existing = await stripe.prices.list({
    lookup_keys: [PRO_PLAN.lookupKey],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const product = await stripe.products.create({
    name: PRO_PLAN.name,
    description: PRO_PLAN.description,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRO_PLAN.amount,
    currency: PRO_PLAN.currency,
    recurring: { interval: PRO_PLAN.interval },
    lookup_key: PRO_PLAN.lookupKey,
  });

  return price.id;
}
