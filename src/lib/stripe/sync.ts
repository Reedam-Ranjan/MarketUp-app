import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "./server";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function periodEndISO(sub: Stripe.Subscription): string | null {
  // Older Stripe API versions expose `current_period_end` on the Subscription;
  // newer ones moved it onto each subscription item. Check both.
  const s = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const end = s.current_period_end ?? s.items?.data?.[0]?.current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
}

/** Writes subscription state onto a user's profile (service role, bypasses RLS). */
export async function syncSubscriptionForUser(
  userId: string,
  sub: Stripe.Subscription,
) {
  const admin = createAdminClient();
  const isPro = ACTIVE_STATUSES.has(sub.status);
  await admin
    .from("profiles")
    .update({
      is_pro: isPro,
      plan: isPro ? "pro" : "free",
      stripe_subscription_id: sub.id,
      current_period_end: periodEndISO(sub),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/**
 * Resolves the Supabase user for a Stripe customer and syncs their latest
 * subscription. Used by webhook events that only carry a customer id.
 */
export async function syncSubscriptionByCustomer(customerId: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  if (!profile) return;

  const stripe = getStripe();
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });
  const sub = subs.data[0];
  if (!sub) return;

  await syncSubscriptionForUser(profile.id, sub);
}
