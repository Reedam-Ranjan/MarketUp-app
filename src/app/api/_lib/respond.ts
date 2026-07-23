import { NextResponse } from "next/server";
import { MarketDataError } from "@/lib/market";

/** Maps provider errors to JSON HTTP responses; logs unexpected ones. */
export function handleError(error: unknown): NextResponse {
  if (error instanceof MarketDataError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  console.error("[api] unexpected error:", error);
  return NextResponse.json(
    { error: "Something went wrong fetching market data." },
    { status: 500 },
  );
}
