import Link from "next/link";
import type { SubjectIconId } from "@/lib/figures";

/** Line icon per discipline, matching the brand card style. */
export function SubjectIcon({
  id,
  className,
}: {
  id: SubjectIconId;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (id) {
    case "physics":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.6" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M4 9h16M5 9l7-5 7 5M6 9v8M10 9v8M14 9v8M18 9v8M4 20h16" />
        </svg>
      );
    case "biology":
      return (
        <svg {...common}>
          <path d="M11 20C6 20 4 15 4 11 4 6 8 4 13 4c0 0 7 0 7 7 0 5-4 9-9 9z" />
          <path d="M8 17C12 13 13 9 16 7" />
        </svg>
      );
    case "literature":
      return (
        <svg {...common}>
          <path d="M12 6c-2-1.4-4.5-1.6-7-1v13c2.5-.6 5-.4 7 1 2-1.4 4.5-1.6 7-1V5c-2.5-.6-5-.4-7 1z" />
          <path d="M12 6v13" />
        </svg>
      );
    case "logic":
      return (
        <svg {...common}>
          <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
        </svg>
      );
  }
}


/**
 * The Academy crest — a shield bearing the macron "Ā" with a small laurel.
 * Uses currentColor so it inherits gold/ivory from the parent.
 */
export function AcademyCrest({
  className,
  title = "The Academy",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 116"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      {/* shield */}
      <path
        d="M50 4 L92 18 V58 C92 86 72 104 50 112 C28 104 8 86 8 58 V18 Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* macron */}
      <rect x="33" y="32" width="34" height="4.5" rx="2.25" fill="currentColor" />
      {/* A */}
      <path
        d="M50 41 L36 80 H43 L46 70 H54 L57 80 H64 Z M48 63 L50 55 L52 63 Z"
        fill="currentColor"
      />
      {/* laurel sprigs */}
      <path
        d="M34 92 C40 96 45 97 50 97 C55 97 60 96 66 92"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

/** Full lockup: crest + "THE ACADEMY" wordmark. */
export function AcademyWordmark({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string | null;
  compact?: boolean;
}) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <AcademyCrest className="h-8 w-auto text-gold" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-[0.18em] text-ivory">
          THE ACADEMY
        </span>
        {!compact && (
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.28em] text-gold/70">
            Legendary tutors · Real-time · One-to-one
          </span>
        )}
      </span>
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="The Academy — home">
      {content}
    </Link>
  );
}

/** Live status pill: gold/green dot + label. */
export function StatusPill({
  label,
  tone = "gold",
  className,
}: {
  label: string;
  tone?: "gold" | "green" | "stone" | "indigo";
  className?: string;
}) {
  const dot =
    tone === "green"
      ? "bg-emerald-400"
      : tone === "stone"
        ? "bg-stone"
        : tone === "indigo"
          ? "bg-indigo"
          : "bg-gold";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ivory/75 ${className ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${tone === "green" ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}

const arrow = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Primary gold CTA. */
export function GoldButton({
  children,
  className,
  withArrow = true,
}: {
  children: React.ReactNode;
  className?: string;
  withArrow?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-obsidian shadow-[0_8px_30px_-12px_rgba(201,164,106,0.7)] transition hover:brightness-105 ${className ?? ""}`}
    >
      {children}
      {withArrow && arrow}
    </span>
  );
}
