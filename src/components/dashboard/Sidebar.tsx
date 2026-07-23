"use client";

import { useState, type ComponentType, type SVGProps } from "react";
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
} from "@/components/icons";

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const MAIN_NAV: NavItem[] = [
  { label: "Overview", icon: HomeIcon },
  { label: "My Stock", icon: StockIcon },
  { label: "Portfolio", icon: PortfolioIcon },
  { label: "Analytic", icon: AnalyticIcon },
  { label: "Community", icon: CommunityIcon },
  { label: "Account", icon: AccountIcon },
];

const FILES = ["Communication", "Affiliates", "Marketing"];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <circle cx="8" cy="8" r="4.5" opacity="0.95" />
          <circle cx="16" cy="8" r="4.5" opacity="0.75" />
          <circle cx="8" cy="16" r="4.5" opacity="0.75" />
          <circle cx="16" cy="16" r="4.5" opacity="0.95" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Marketcap
      </span>
    </div>
  );
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export default function Sidebar() {
  const [active, setActive] = useState("Portfolio");

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-8 bg-sidebar px-4 py-6">
      <Logo />

      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map(({ label, icon: Icon }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                  : "text-ink-soft hover:bg-surface/60 hover:text-ink"
              }`}
            >
              <Icon className={isActive ? "text-brand" : "text-muted"} />
              {label}
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

      <div className="mt-auto">
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
      </div>
    </aside>
  );
}
