export function formatUSD(value: number, fractionDigits = 2): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPct(value: number): string {
  return `${Math.abs(value).toFixed(2)}%`;
}

/** Short relative time from an epoch-seconds timestamp, e.g. "3h ago". */
export function timeAgo(epochSeconds: number): string {
  const diff = Date.now() / 1000 - epochSeconds;
  if (diff < 60) return "just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Compact currency, e.g. $2.94T, $317.0B, $1.2M. */
export function formatCompactUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  });
}
