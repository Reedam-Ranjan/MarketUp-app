import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import {
  syncSubscriptionByCustomer,
  syncSubscriptionForUser,
} from "@/lib/stripe/sync";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Keeps profile.is_pro in sync with subscription lifecycle
 * events. For local sandbox testing, forward events with:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 * (The /pricing/success page also activates Pro on redirect, so webhooks
 * aren't strictly required to test the happy path.)
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 400 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const subId = session.subscription as string | null;
        if (userId && subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          await syncSubscriptionForUser(userId, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid":
      case "invoice.payment_failed": {
        const obj = event.data.object as { customer?: string };
        if (obj.customer) await syncSubscriptionByCustomer(obj.customer);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
