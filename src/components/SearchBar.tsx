"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "@/components/icons";
import type { SymbolSearchResult } from "@/lib/market/types";

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounced(query.trim(), 250);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Search failed.");
      const data = (await res.json()) as { results: SymbolSearchResult[] };
      return data.results;
    },
    enabled: debounced.length >= 1,
    staleTime: 60_000,
  });

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(symbol: string) {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[highlight]?.symbol ?? results[0].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && debounced.length >= 1;

  return (
    <div ref={containerRef} className="relative w-44 md:w-56">
      <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 ring-1 ring-line focus-within:ring-brand/40">
        <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search stocks…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full z-20 mt-2 max-h-80 w-80 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
          {isFetching && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">
              No matches for &ldquo;{debounced}&rdquo;.
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.symbol}-${i}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => go(r.symbol)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === highlight ? "bg-canvas" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {r.description || r.symbol}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {r.displaySymbol}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-canvas px-2 py-1 text-xs font-semibold text-ink-soft">
                  {r.symbol}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
