"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@/components/icons";
import AddToPortfolioModal from "@/components/AddToPortfolioModal";

export default function AddToPortfolioButton({
  symbol,
  isPro,
  currentPrice,
}: {
  symbol: string;
  isPro: boolean;
  currentPrice?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          // Adding to a portfolio is Pro-only; free users are sent to pricing.
          if (!isPro) {
            router.push("/pricing");
            return;
          }
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        <PlusIcon width={16} height={16} />
        Add to Portfolio
      </button>

      {open && (
        <AddToPortfolioModal
          symbol={symbol}
          currentPrice={currentPrice}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
