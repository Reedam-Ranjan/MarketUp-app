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

/** GET /api/watchlist -> the signed-in user's saved stocks. */
export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("watchlist_items")
    .select("symbol, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

/** POST /api/watchlist { symbol, name } -> save a stock (Pro only, via RLS). */
export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    symbol?: string;
    name?: string;
  };
  const symbol = body.symbol?.trim().toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({ user_id: user.id, symbol, name: body.name ?? null })
    .select("symbol, name")
    .single();

  if (error) {
    // Row-level security blocked the insert -> user isn't on the Pro plan.
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "Upgrade to Pro to save stocks to your watchlist." },
        { status: 403 },
      );
    }
    // Already saved — treat as success (idempotent).
    if (error.code === "23505") {
      return NextResponse.json({ item: { symbol, name: body.name } });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

/** DELETE /api/watchlist?symbol=AAPL -> remove a saved stock. */
export async function DELETE(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol." }, { status: 400 });
  }

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("symbol", symbol);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
