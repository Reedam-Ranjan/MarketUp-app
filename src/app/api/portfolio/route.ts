import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** GET /api/portfolio -> the signed-in user's holdings. */
export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("holdings")
    .select("id, symbol, shares, cost_basis, purchase_date, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

/**
 * POST /api/portfolio { symbol, shares, cost_basis, purchase_date }
 * -> add a holding (Pro only, enforced via RLS).
 */
export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    symbol?: string;
    shares?: number;
    cost_basis?: number;
    purchase_date?: string | null;
  };

  const symbol = body.symbol?.trim().toUpperCase();
  const shares = Number(body.shares);
  const costBasis = Number(body.cost_basis);

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol." }, { status: 400 });
  }
  if (!Number.isFinite(shares) || shares <= 0) {
    return NextResponse.json(
      { error: "Shares must be a positive number." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(costBasis) || costBasis < 0) {
    return NextResponse.json(
      { error: "Purchase price must be zero or more." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("holdings")
    .insert({
      user_id: user.id,
      symbol,
      shares,
      cost_basis: costBasis,
      purchase_date: body.purchase_date || null,
    })
    .select("id, symbol, shares, cost_basis, purchase_date")
    .single();

  if (error) {
    // Row-level security blocked the insert -> user isn't on the Pro plan.
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "Upgrade to Pro to add holdings to your portfolio." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

/** DELETE /api/portfolio?id=<uuid> -> remove a holding. */
export async function DELETE(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("holdings")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
