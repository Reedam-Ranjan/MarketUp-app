import { NextRequest, NextResponse } from "next/server";
import { marketData, type CandleRange } from "@/lib/market";
import { handleError } from "../_lib/respond";

export const dynamic = "force-dynamic";

const RANGES: CandleRange[] = ["1D", "1W", "1M", "1Y"];

/** GET /api/candles?symbol=AAPL&range=1M -> Candle[] */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get("symbol");
  const range = (searchParams.get("range") ?? "1M") as CandleRange;

  if (!symbol) {
    return NextResponse.json(
      { error: "Provide a `symbol` query parameter." },
      { status: 400 },
    );
  }
  if (!RANGES.includes(range)) {
    return NextResponse.json(
      { error: `Invalid range. Use one of: ${RANGES.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const candles = await marketData.getCandles(symbol, range);
    return NextResponse.json({ candles });
  } catch (error) {
    return handleError(error);
  }
}
