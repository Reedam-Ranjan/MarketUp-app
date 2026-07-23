import { ArrowUpIcon, ArrowDownIcon } from "@/components/icons";
import { formatPct } from "@/lib/format";

/**
 * Colored up/down percentage indicator. `variant="pill"` renders the rounded
 * tinted background used in tables and next to the portfolio total; `variant`
 * "inline" is the bare arrow + number used on the summary cards.
 */
export default function ChangeBadge({
  value,
  variant = "inline",
  className = "",
}: {
  value: number;
  variant?: "inline" | "pill";
  className?: string;
}) {
  const up = value >= 0;
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
  const color = up ? "text-up" : "text-down";

  const content = (
    <>
      <Arrow width={14} height={14} className={color} />
      <span className={`font-semibold ${color}`}>{formatPct(value)}</span>
    </>
  );

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
          up ? "bg-up-soft" : "bg-down-soft"
        } ${className}`}
      >
        {content}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      {content}
    </span>
  );
}
