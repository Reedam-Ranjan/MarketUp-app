import DashboardShell from "@/components/dashboard/DashboardShell";
import PortfolioView from "@/components/dashboard/PortfolioView";

export default function PortfolioPage() {
  return (
    <DashboardShell
      title="Portfolio"
      subtitle="All your stock holdings in one place."
    >
      <PortfolioView />
    </DashboardShell>
  );
}
