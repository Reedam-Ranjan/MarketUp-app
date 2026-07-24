"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import SearchBar from "@/components/SearchBar";
import { BellIcon, MenuIcon } from "@/components/icons";

function TopBar({
  title,
  subtitle,
  email,
  isPro,
  onMenu,
}: {
  title?: string;
  subtitle?: string;
  email?: string | null;
  isPro?: boolean;
  onMenu: () => void;
}) {
  const initials = (email ?? "?").slice(0, 2).toUpperCase();
  return (
    <header className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:px-8">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:text-brand lg:hidden"
      >
        <MenuIcon width={20} height={20} />
      </button>

      {(title || subtitle) && (
        <div className="hidden min-w-0 sm:block">
          {title && (
            <h1 className="truncate text-lg font-bold text-ink sm:text-xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="truncate text-sm text-muted">{subtitle}</p>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <SearchBar />
        {!isPro && (
          <Link
            href="/pricing"
            className="hidden rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:block"
          >
            Upgrade
          </Link>
        )}
        <button
          aria-label="Notifications"
          className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-line transition hover:text-brand sm:grid"
        >
          <BellIcon width={20} height={20} />
        </button>
        <div className="flex items-center gap-2">
          <span
            title={email ?? undefined}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white sm:h-11 sm:w-11"
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

/**
 * Client frame that owns the mobile-drawer state so the top-bar hamburger and
 * the Sidebar drawer can share it. The server DashboardShell wraps this and
 * supplies the profile.
 */
export default function DashboardChrome({
  children,
  title,
  subtitle,
  email,
  isPro,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  email?: string | null;
  isPro?: boolean;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas p-0 sm:p-3 md:p-4">
      <div className="flex w-full overflow-hidden rounded-none bg-surface shadow-sm ring-1 ring-line sm:rounded-3xl">
        <Sidebar
          email={email}
          isPro={isPro}
          open={navOpen}
          onClose={() => setNavOpen(false)}
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-canvas/60">
          <TopBar
            title={title}
            subtitle={subtitle}
            email={email}
            isPro={isPro}
            onMenu={() => setNavOpen(true)}
          />
          <div className="flex flex-col gap-6 px-4 pb-8 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
