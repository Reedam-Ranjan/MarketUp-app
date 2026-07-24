import DashboardShell from "@/components/dashboard/DashboardShell";
import SubscribeButton from "@/components/SubscribeButton";
import { getProfile } from "@/lib/supabase/auth";
import { PRO_PLAN_PRICE_LABEL } from "@/lib/stripe/config";

function Check({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-ink-soft">
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-4 w-4 shrink-0 text-up"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
      {children}
    </li>
  );
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;
  const profile = await getProfile();
  const isPro = profile?.is_pro ?? false;

  return (
    <DashboardShell
      title="Pricing"
      subtitle="Upgrade to save stocks to your watchlist."
    >
      {canceled && (
        <p className="rounded-xl bg-down-soft px-4 py-3 text-sm text-down">
          Checkout canceled — you have not been charged.
        </p>
      )}

      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col gap-6 rounded-card border border-line bg-surface p-7">
          <div>
            <h3 className="text-lg font-bold text-ink">Free</h3>
            <p className="mt-1 text-sm text-muted">
              Explore the market at no cost.
            </p>
            <p className="mt-4 text-4xl font-extrabold tracking-tight text-ink">
              $0
              <span className="text-base font-medium text-muted">/mo</span>
            </p>
          </div>
          <ul className="flex flex-1 flex-col gap-3">
            <Check>Live stock prices &amp; day changes</Check>
            <Check>Interactive price-history charts</Check>
            <Check>Company profiles &amp; latest news</Check>
            <Check>Unlimited symbol search</Check>
          </ul>
          <div className="rounded-full border border-line-strong px-4 py-3 text-center text-sm font-semibold text-muted">
            {isPro ? "Included" : "Your current plan"}
          </div>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col gap-6 rounded-card border-2 border-brand bg-surface p-7 shadow-sm">
          <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
            Most popular
          </span>
          <div>
            <h3 className="text-lg font-bold text-ink">Pro</h3>
            <p className="mt-1 text-sm text-muted">
              Build and track your own watchlist.
            </p>
            <p className="mt-4 text-4xl font-extrabold tracking-tight text-ink">
              {PRO_PLAN_PRICE_LABEL}
              <span className="text-base font-medium text-muted">/mo</span>
            </p>
          </div>
          <ul className="flex flex-1 flex-col gap-3">
            <Check>Everything in Free</Check>
            <Check>Save unlimited stocks to your watchlist</Check>
            <Check>Personalized dashboard of your stocks</Check>
            <Check>Cancel anytime</Check>
          </ul>
          {isPro ? (
            <div className="rounded-full bg-brand-soft px-4 py-3 text-center text-sm font-semibold text-brand">
              You&apos;re on Pro ✓
            </div>
          ) : (
            <SubscribeButton label={`Upgrade — ${PRO_PLAN_PRICE_LABEL}/mo`} />
          )}
        </div>
      </div>

      <p className="mx-auto max-w-3xl text-center text-xs text-muted">
        Test mode — use Stripe test card 4242 4242 4242 4242, any future expiry,
        any CVC and ZIP.
      </p>
    </DashboardShell>
  );
}
