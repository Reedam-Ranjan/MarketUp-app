import DashboardShell from "@/components/dashboard/DashboardShell";
import StockSummaryCards from "@/components/dashboard/StockSummaryCards";
import PortfolioValues from "@/components/dashboard/PortfolioValues";
import StatisticsChart from "@/components/dashboard/StatisticsChart";
import MyStockTable from "@/components/dashboard/MyStockTable";
import { DEFAULT_WATCHLIST } from "@/lib/watchlist";

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Portfolio"
      subtitle="Track your investments and the market at a glance."
    >
      <StockSummaryCards watchlist={DEFAULT_WATCHLIST} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PortfolioValues />
        </div>
        <div className="lg:col-span-3">
          <StatisticsChart />
        </div>
      </div>

      <MyStockTable watchlist={DEFAULT_WATCHLIST} />
    </DashboardShell>
  );
}
