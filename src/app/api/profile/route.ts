import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/market";
import { handleError } from "../_lib/respond";

export const dynamic = "force-dynamic";

/** GET /api/profile?symbol=AAPL -> CompanyProfile */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json(
      { error: "Provide a `symbol` query parameter." },
      { status: 400 },
    );
  }
  try {
    const profile = await marketData.getCompanyProfile(symbol);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleError(error);
  }
}
