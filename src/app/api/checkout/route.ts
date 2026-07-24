import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getStripe, getOrCreateProPriceId } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

/** POST /api/checkout -> { url } to Stripe's hosted subscription checkout. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_pro, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.is_pro) {
      return NextResponse.json(
        { error: "You're already on the Pro plan." },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    // Reuse (or create) the Stripe customer for this user.
    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const priceId = await getOrCreateProPriceId();

    // Build the redirect base from the ACTUAL request host so Stripe returns
    // the user to wherever they are (localhost in dev, the deployed domain in
    // prod). Deriving this from the request avoids the classic failure where a
    // stale NEXT_PUBLIC_SITE_URL=localhost in the deploy env sends the redirect
    // to the user's own machine. Falls back to the env var, then the origin.
    const forwardedHost =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const forwardedProto =
      req.headers.get("x-forwarded-proto") ??
      req.nextUrl.protocol.replace(":", "");
    const siteUrl =
      (forwardedHost && `${forwardedProto}://${forwardedHost}`) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing?canceled=1`,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err);
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
