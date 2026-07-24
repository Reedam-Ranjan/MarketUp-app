import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StockDetail from "@/components/dashboard/StockDetail";
import { getProfile } from "@/lib/supabase/auth";

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
  const profile = await getProfile();
  return (
    <DashboardShell>
      <StockDetail symbol={symbol.toUpperCase()} isPro={profile?.is_pro ?? false} />
    </DashboardShell>
  );
}
