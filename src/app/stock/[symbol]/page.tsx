import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StockDetail from "@/components/dashboard/StockDetail";

type Params = { symbol: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} — Marketcap` };
}

export default async function StockPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { symbol } = await params;
  return (
    <DashboardShell>
      <StockDetail symbol={symbol.toUpperCase()} />
    </DashboardShell>
  );
}
