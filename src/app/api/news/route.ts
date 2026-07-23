import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/market";
import { handleError } from "../_lib/respond";

export const dynamic = "force-dynamic";

/**
 * GET /api/news              -> general market news
 * GET /api/news?symbol=AAPL  -> company news
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  try {
    const news = symbol
      ? await marketData.getCompanyNews(symbol)
      : await marketData.getMarketNews();
    return NextResponse.json({ news });
  } catch (error) {
    return handleError(error);
  }
}
