import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/market/types";

export default function NewsList({
  items,
  isLoading,
  isError,
  emptyLabel = "No recent news.",
}: {
  items: NewsItem[];
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-canvas"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted">Couldn&apos;t load news.</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-line">
      {items.slice(0, 12).map((n) => (
        <li key={n.id}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 py-4 transition hover:opacity-80"
          >
            {n.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={n.image}
                alt=""
                className="h-16 w-24 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-24 shrink-0 rounded-lg bg-canvas" />
            )}
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-ink">{n.headline}</p>
              <p className="mt-1 text-xs text-muted">
                {n.source} · {timeAgo(n.datetime)}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
