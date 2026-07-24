"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  HomeIcon,
  StockIcon,
  PortfolioIcon,
  AnalyticIcon,
  CommunityIcon,
  AccountIcon,
  FolderIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  SparkleIcon,
} from "@/components/icons";

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
};

const MAIN_NAV: NavItem[] = [
  { label: "Overview", icon: HomeIcon, href: "/" },
  { label: "My Stock", icon: StockIcon, href: "/my-stock" },
  { label: "Portfolio", icon: PortfolioIcon, href: "/portfolio" },
  { label: "Analytic", icon: AnalyticIcon },
  { label: "Community", icon: CommunityIcon },
  { label: "Account", icon: AccountIcon },
];

const FILES = ["Communication", "Affiliates", "Marketing"];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-base font-extrabold text-white shadow-sm shadow-brand/30">
        M
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Marketcap
      </span>
    </Link>
  );
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export default function Sidebar({
  email,
  isPro,
  open = false,
  onClose,
}: {
  email?: string | null;
  isPro?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    setSigningOut(true);
    onClose?.();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (email ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
      {/* Backdrop — only on mobile when the drawer is open. */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col gap-6 overflow-y-auto bg-sidebar px-4 py-6 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink lg:hidden"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map(({ label, icon: Icon, href }) => {
          const isActive = href
            ? href === "/"
              ? pathname === "/"
              : pathname.startsWith(href)
            : false;
          const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive
              ? "bg-surface text-ink shadow-sm ring-1 ring-line"
              : "text-ink-soft hover:bg-surface/60 hover:text-ink"
          }`;
          const inner = (
            <>
              <Icon className={isActive ? "text-brand" : "text-muted"} />
              {label}
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={className}
            >
              {inner}
            </Link>
          ) : (
            <button key={label} className={className}>
              {inner}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center justify-between px-3">
          <span className="text-sm font-semibold text-muted">Files</span>
          <button className="grid h-6 w-6 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-brand">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
        {FILES.map((label) => (
          <button
            key={label}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-surface/60 hover:text-ink"
          >
            <FolderIcon className="text-muted" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {/* Upgrade prompt for free users */}
        {!isPro && (
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-3.5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            <SparkleIcon width={16} height={16} />
            Upgrade to Pro
          </Link>
        )}

        {/* Theme toggle */}
        <div className="flex items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-line">
          <button
            onClick={() => setTheme(false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition bg-brand-soft text-brand dark:bg-transparent dark:text-muted dark:hover:text-ink"
          >
            <SunIcon width={16} height={16} /> Light
          </button>
          <button
            onClick={() => setTheme(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition text-muted hover:text-ink dark:bg-brand-soft dark:text-brand"
          >
            <MoonIcon width={16} height={16} /> Dark
          </button>
        </div>

        {/* User + sign out */}
        {email && (
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{email}</p>
              <p className="text-xs text-muted">
                {isPro ? "Pro plan" : "Free plan"}
              </p>
            </div>
            <button
              onClick={signOut}
              disabled={signingOut}
              title="Sign out"
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-muted transition hover:bg-canvas hover:text-down disabled:opacity-60"
            >
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}
