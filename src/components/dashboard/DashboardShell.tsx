import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import SearchBar from "@/components/SearchBar";
import { BellIcon } from "@/components/icons";
import { getProfile } from "@/lib/supabase/auth";

function TopBar({
  title,
  subtitle,
  email,
  isPro,
}: {
  title?: string;
  subtitle?: string;
  email?: string | null;
  isPro?: boolean;
}) {
  const initials = (email ?? "?").slice(0, 2).toUpperCase();
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
        {!isPro && (
          <Link
            href="/pricing"
            className="hidden rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:block"
          >
            Upgrade
          </Link>
        )}
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-line transition hover:text-brand">
          <BellIcon width={20} height={20} />
        </button>
        <div className="flex items-center gap-2">
          <span
            title={email ?? undefined}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white"
          >
            {initials}
          </span>
          {isPro && (
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand">
              Pro
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

/** Shared app frame: sidebar + top bar (with search) + scrollable content. */
export default async function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const profile = await getProfile();
  const email = profile?.email ?? null;
  const isPro = profile?.is_pro ?? false;

  return (
    <div className="flex min-h-screen bg-canvas p-3 md:p-4">
      <div className="flex w-full overflow-hidden rounded-3xl bg-surface shadow-sm ring-1 ring-line">
        <Sidebar email={email} isPro={isPro} />
        <main className="flex-1 overflow-y-auto bg-canvas/60">
          <TopBar
            title={title}
            subtitle={subtitle}
            email={email}
            isPro={isPro}
          />
          <div className="flex flex-col gap-6 px-6 pb-8 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
