import type { ReactNode } from "react";

type LogoDef = {
  bg: string;
  node: ReactNode;
};

/**
 * Small registry of recognizable brand marks rendered as inline SVG so we
 * don't depend on any external image assets. Tickers not found here fall back
 * to a colored monogram avatar.
 */
const LOGOS: Record<string, LogoDef> = {
  AAPL: {
    bg: "#111111",
    node: (
      <path
        fill="#fff"
        d="M17.05 12.53c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.37 1.02-4.27 2.59-1.82 3.16-.47 7.84 1.3 10.41.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.85 3.39-.85 1.58 0 2.03.85 3.4.82 1.4-.02 2.29-1.28 3.15-2.55.99-1.46 1.4-2.87 1.42-2.94-.03-.01-2.73-1.05-2.76-4.16zM14.9 4.99c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.45z"
      />
    ),
  },
  GOOGL: {
    bg: "#ffffff",
    node: (
      <>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
        />
      </>
    ),
  },
  SPOT: {
    bg: "#1DB954",
    node: (
      <g
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M6 9.4c4-1.1 8.2-.7 11.2 1.2" />
        <path d="M6.8 12.5c3.3-.9 6.8-.5 9.4 1.1" />
        <path d="M7.6 15.4c2.6-.7 5.4-.4 7.5.9" />
      </g>
    ),
  },
  TWTR: {
    bg: "#1DA1F2",
    node: (
      <path
        fill="#fff"
        d="M23 4.6c-.8.36-1.67.6-2.58.71a4.5 4.5 0 0 0 1.98-2.48 9 9 0 0 1-2.86 1.09 4.5 4.5 0 0 0-7.66 4.1A12.77 12.77 0 0 1 2.6 3.4a4.5 4.5 0 0 0 1.39 6 4.47 4.47 0 0 1-2.04-.56v.06a4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2.03.08 4.5 4.5 0 0 0 4.2 3.12A9 9 0 0 1 1 18.57 12.73 12.73 0 0 0 7.9 20.6c8.3 0 12.84-6.88 12.84-12.84l-.01-.58A9.2 9.2 0 0 0 23 4.6z"
      />
    ),
  },
};

/** Brand colors used for the monogram fallback avatars. */
const MONOGRAM_BG: Record<string, string> = {
  MSFT: "#2f6df4",
  AMZN: "#ff9900",
  NVDA: "#76b900",
  TSLA: "#e82127",
  NFLX: "#e50914",
  META: "#0866ff",
};

const SIZES = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
} as const;

export default function BrandLogo({
  symbol,
  size = "md",
}: {
  symbol: string;
  size?: keyof typeof SIZES;
}) {
  const logo = LOGOS[symbol];
  const box = SIZES[size];

  if (logo) {
    return (
      <span
        className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full ring-1 ring-black/5`}
        style={{ background: logo.bg }}
      >
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden>
          {logo.node}
        </svg>
      </span>
    );
  }

  const bg = MONOGRAM_BG[symbol] ?? "#6b7280";
  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-black/5`}
      style={{ background: bg }}
    >
      {symbol.slice(0, 2)}
    </span>
  );
}
