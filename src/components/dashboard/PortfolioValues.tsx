"use client";

import { useState } from "react";
import ChangeBadge from "@/components/ChangeBadge";
import { DotsIcon, SparkleIcon, ChevronRightIcon } from "@/components/icons";
import { formatUSD } from "@/lib/format";
import { portfolio } from "@/lib/mock-data";

export default function PortfolioValues() {
  const [view, setView] = useState<"top" | "worst">("top");

  return (
    <section className="flex flex-col gap-6 rounded-card border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Portfolio Values</h2>
        <button className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas">
          <DotsIcon width={18} height={18} />
        </button>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-ink">
            {formatUSD(portfolio.total, 2)}
          </span>
          <ChangeBadge value={portfolio.changePct} variant="pill" />
        </div>
        <p className="mt-3 text-ink-soft">
          You profits is{" "}
          <span className="font-semibold text-ink">
            {formatUSD(portfolio.profit, 2)}
          </span>{" "}
          in this months.
        </p>
        <p className="text-muted">that&apos;s the best result in the last three months.</p>
      </div>

      <div className="inline-flex gap-2">
        <button
          onClick={() => setView("worst")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            view === "worst"
              ? "bg-brand text-white"
              : "border border-line-strong text-ink-soft hover:bg-canvas"
          }`}
        >
          Worst Performance
        </button>
        <button
          onClick={() => setView("top")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            view === "top"
              ? "bg-brand text-white"
              : "border border-line-strong text-ink-soft hover:bg-canvas"
          }`}
        >
          Top Performance
        </button>
      </div>

      <button className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-soft to-brand-soft/40 p-4 text-left transition hover:from-brand-soft hover:to-brand-soft/60">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-brand shadow-sm">
          <SparkleIcon width={18} height={18} />
        </span>
        <span className="flex-1 text-sm font-medium text-brand-dark">
          Here&apos;s to improve your portfolio and understanding how investing
          works.
        </span>
        <ChevronRightIcon
          width={18}
          height={18}
          className="text-brand transition group-hover:translate-x-0.5"
        />
      </button>
    </section>
  );
}
