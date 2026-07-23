import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import SearchBar from "@/components/SearchBar";
import { BellIcon } from "@/components/icons";

function TopBar({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="flex items-center gap-4 px-6 py-5 md:px-8">
      {(title || subtitle) && (
        <div>
          {title && <h1 className="text-xl font-bold text-ink">{title}</h1>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      )}
      <div className="ml-auto flex items-center gap-3">
        <SearchBar />
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-line transition hover:text-brand">
          <BellIcon width={20} height={20} />
        </button>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
          MC
        </span>
      </div>
    </header>
  );
}

/** Shared app frame: sidebar + top bar (with search) + scrollable content. */
export default function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen bg-canvas p-3 md:p-4">
      <div className="flex w-full overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-canvas/60">
          <TopBar title={title} subtitle={subtitle} />
          <div className="flex flex-col gap-6 px-6 pb-8 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
