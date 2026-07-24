import DashboardShell from "@/components/dashboard/DashboardShell";
import MyStockView from "@/components/dashboard/MyStockView";

export default function MyStockPage() {
  return (
    <DashboardShell
      title="My Stock"
      subtitle="The stocks you've saved to your watchlist."
    >
      <MyStockView />
    </DashboardShell>
  );
}
