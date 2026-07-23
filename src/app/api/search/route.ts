import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/market";
import { handleError } from "../_lib/respond";

export const dynamic = "force-dynamic";

/** GET /api/search?q=apple -> SymbolSearchResult[] */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await marketData.searchSymbols(q);
    return NextResponse.json({ results });
  } catch (error) {
    return handleError(error);
  }
}
