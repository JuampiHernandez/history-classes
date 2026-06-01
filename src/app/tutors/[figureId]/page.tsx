import Link from "next/link";
import { notFound } from "next/navigation";
import { FIGURES, getFigure } from "@/lib/figures";
import {
  AcademyWordmark,
  GoldButton,
  StatusPill,
  SubjectIcon,
} from "@/components/brand";

export function generateStaticParams() {
  return FIGURES.map((f) => ({ figureId: f.id }));
}

const HIGHLIGHTS = [
  {
    title: "Live conversation",
    body: "Natural, real-time dialogue",
    icon: <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  },
  {
    title: "In-character tutoring",
    body: "Immersive & motivating",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M19 20a6 6 0 0 0-3-5" />
      </>
    ),
  },
  {
    title: "Whiteboard diagrams",
    body: "Visuals that make it click",
    icon: <path d="M12 20h9M3 20h3M4 16.5 16.5 4a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z" />,
  },
  {
    title: "Exam-ready focus",
    body: "Clarity. Confidence. Results.",
    icon: (
      <>
        <path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0z" />
        <path d="M6 5H4v2a3 3 0 0 0 2 2.8M18 5h2v2a3 3 0 0 1-2 2.8" />
      </>
    ),
  },
];

export default async function TutorProfile({
  params,
}: {
  params: Promise<{ figureId: string }>;
}) {
  const { figureId } = await params;
  const figure = getFigure(figureId);
  if (!figure) notFound();

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      {/* Tutor portrait bleeding from the right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
        <img
          src={figure.imageUrl}
          alt={figure.fullName}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </div>

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <AcademyWordmark compact />
          <div className="flex items-center gap-4">
            <StatusPill label="Live lip-sync sessions" tone="green" className="hidden sm:inline-flex" />
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm font-semibold"
              style={{ color: figure.accent }}
            >
              {figure.fullName.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ivory/60 transition hover:text-ivory"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All tutors
        </Link>

        <div className="mt-10 max-w-xl">
          <p
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: figure.accent }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
              <SubjectIcon id={figure.icon} className="h-3.5 w-3.5" />
            </span>
            {figure.subject}
          </p>

          <h1 className="mt-5 font-display display-tight text-5xl font-semibold sm:text-6xl">
            {figure.fullName}
          </h1>

          <div className="mt-5 h-px w-16 bg-gold/60" />
          <p className="mt-5 font-display text-xl italic text-gold">
            {figure.tagline}
          </p>

          <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/65">
            Face-to-face tutoring with a legendary mind. Speak naturally in live
            conversation — {figure.name} responds in real time, moves with every
            word, and uses the whiteboard to map ideas, causes, and consequences.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href={`/session/${figure.id}`}>
              <GoldButton className="px-8 py-4 text-base">Start live session</GoldButton>
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-ivory/60">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M3 9h18" />
              </svg>
              Preview teaching style
            </span>
          </div>
        </div>

        <div className="mt-16 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-8 border-t border-white/[0.06] pt-8 lg:max-w-3xl lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="flex flex-col gap-2">
              <span className="text-gold">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {h.icon}
                </svg>
              </span>
              <p className="text-sm font-semibold text-ivory">{h.title}</p>
              <p className="text-xs leading-relaxed text-ivory/50">{h.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
