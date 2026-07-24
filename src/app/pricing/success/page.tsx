import Link from "next/link";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { syncSubscriptionForUser } from "@/lib/stripe/sync";

export const dynamic = "force-dynamic";

/**
 * Activates Pro from the Stripe Checkout session alone — the session carries
 * `metadata.supabase_user_id` (set when we created it), so we don't depend on
 * the browser session being present on the redirect back from Stripe. This
 * mirrors the webhook and keeps activation working even if the auth cookie
 * hiccups on return (which would otherwise bounce the user to /login and skip
 * activation entirely).
 */
async function activate(sessionId: string): Promise<boolean> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const userId = session.metadata?.supabase_user_id;
    if (!userId) return false;

    const sub = session.subscription as Stripe.Subscription | null;
    if (!sub) return false;

    await syncSubscriptionForUser(userId, sub);
    return true;
  } catch (err) {
    console.error("[pricing/success] activation failed:", err);
    return false;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const activated = session_id ? await activate(session_id) : false;

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-up-soft text-up">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m5 12 4.5 4.5L19 7" />
          </svg>
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
          You&apos;re on Pro! 🎉
        </h1>
        <p className="mt-2 text-ink-soft">
          {activated
            ? "Your subscription is active. You can now save stocks to your watchlist."
            : "Payment received. Your subscription is being activated — refresh in a moment if it hasn't updated yet."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Go to dashboard
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
