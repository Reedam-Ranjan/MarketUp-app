import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/market";
import { handleError } from "../_lib/respond";

// Always run fresh on the server; caching is handled inside the provider.
export const dynamic = "force-dynamic";

/**
 * GET /api/quote?symbol=AAPL         -> single Quote
 * GET /api/quote?symbols=AAPL,GOOGL  -> Quote[]
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbolsParam = searchParams.get("symbols");
  const symbol = searchParams.get("symbol");

  try {
    if (symbolsParam) {
      const symbols = symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const quotes = await marketData.getQuotes(symbols);
      return NextResponse.json({ quotes });
    }

    if (symbol) {
      const quote = await marketData.getQuote(symbol);
      return NextResponse.json({ quote });
    }

    return NextResponse.json(
      { error: "Provide a `symbol` or `symbols` query parameter." },
      { status: 400 },
    );
  } catch (error) {
    return handleError(error);
  }
}
