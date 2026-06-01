import Link from "next/link";
import type { Metadata } from "next";
import { FIGURES } from "@/lib/figures";
import {
  AcademyCrest,
  AcademyWordmark,
  GoldButton,
  StatusPill,
  SubjectIcon,
} from "@/components/brand";

export const metadata: Metadata = {
  title: "Brand — The Academy",
  description:
    "The Academy brand system: logo, positioning, color palette, typography, and UI components.",
};

const COLORS = [
  { name: "Obsidian", hex: "#0B0D12", text: "#F6F4EE" },
  { name: "Charcoal", hex: "#14161C", text: "#F6F4EE" },
  { name: "Ivory", hex: "#F6F4EE", text: "#0B0D12" },
  { name: "Gold", hex: "#C9A46A", text: "#0B0D12" },
  { name: "Indigo", hex: "#7A7DFF", text: "#0B0D12" },
  { name: "Stone", hex: "#8A8F98", text: "#0B0D12" },
];

const MOOD = ["Confident", "Scholarly", "Modern", "Focused", "Human"];

function Panel({
  index,
  title,
  className,
  children,
}: {
  index: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-charcoal/40 p-6 ${className ?? ""}`}
    >
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/40">
        {index} &nbsp;{title}
      </p>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <AcademyWordmark compact />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ivory/60 transition hover:text-ivory"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="font-display display-tight text-4xl font-semibold sm:text-5xl">
          Brand System
        </h1>
        <p className="mt-3 max-w-xl text-ivory/55">
          The Academy — voice-first exam prep with legendary tutors. Everything
          you need to build on-brand surfaces.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 01 Logo */}
          <Panel index="01" title="Logo & Wordmark" className="lg:col-span-2">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <AcademyCrest className="h-24 w-auto text-gold" />
                <div>
                  <p className="font-display text-3xl font-semibold leading-none tracking-[0.12em]">
                    THE
                    <br />
                    ACADEMY
                  </p>
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold/70">
                    Legendary tutors · Real-time · One-to-one
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* 02 Positioning */}
          <Panel index="02" title="Brand Positioning">
            <p className="font-display text-2xl font-semibold leading-snug">
              Voice-first exam prep with legendary tutors.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/55">
              Live lip-synced avatars. Real-time whiteboard. One-to-one sessions
              that adapt to you.
            </p>
          </Panel>

          {/* 03 Icon */}
          <Panel index="03" title="Icon / App Mark">
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-charcoal to-obsidian shadow-2xl ring-1 ring-white/10">
                <AcademyCrest className="h-16 w-auto text-gold" />
              </div>
              <div className="flex items-end gap-5 text-ivory/40">
                {[32, 24, 16].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <AcademyCrest className="text-gold" />
                    <span className="text-[10px]">{s}px</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* 04 Color */}
          <Panel index="04" title="Color Palette" className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {COLORS.map((c) => (
                <div key={c.name} className="flex flex-col gap-2">
                  <div
                    className="flex h-20 items-end rounded-xl border border-white/10 p-2"
                    style={{ background: c.hex, color: c.text }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-ivory">{c.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-ivory/40">
                      {c.hex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 05 Typography */}
          <Panel index="05" title="Typography">
            <div className="flex items-start gap-6">
              <div>
                <p className="font-display text-5xl font-semibold">Aa</p>
                <p className="mt-2 text-xs text-ivory/50">Display / Headings</p>
                <p className="text-xs font-medium text-ivory/70">Lora SemiBold</p>
              </div>
              <div>
                <p className="text-5xl font-normal">Aa</p>
                <p className="mt-2 text-xs text-ivory/50">Interface / UI Text</p>
                <p className="text-xs font-medium text-ivory/70">Inter Regular</p>
              </div>
            </div>
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="font-display text-2xl font-semibold leading-tight">
                Tomorrow&apos;s exam.
                <br />
                Legendary minds.
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/35">
                Lora SemiBold · 56–64px · -1%
              </p>
            </div>
          </Panel>

          {/* 06 UI Components */}
          <Panel index="06" title="UI Components">
            <div className="flex flex-wrap items-center gap-3">
              <GoldButton withArrow>Start live session</GoldButton>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-ivory/80">
                Explore tutors
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusPill label="Mic connected" tone="gold" />
              <StatusPill label="Live lip-sync" tone="green" />
            </div>
            <div className="mt-4 flex flex-wrap gap-6 border-t border-white/[0.06] pt-4 text-sm">
              {["Tutors", "Sessions", "Whiteboard", "Insights"].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 0
                      ? "border-b-2 border-gold pb-1 font-medium text-ivory"
                      : "pb-1 text-ivory/45"
                  }
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-obsidian/60 px-4 py-2.5 text-sm text-ivory/35">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search tutors, subjects, topics…
            </div>
          </Panel>

          {/* 07 Mood */}
          <Panel index="07" title="Mood">
            <ul className="space-y-1.5">
              {MOOD.map((m) => (
                <li key={m} className="font-display text-lg text-ivory/80">
                  {m}
                </li>
              ))}
            </ul>
          </Panel>

          {/* 08 Live Session example */}
          <Panel index="08" title="Live Session (example)" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
                <img
                  src={FIGURES[1].imageUrl}
                  alt={FIGURES[1].fullName}
                  className="aspect-square w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-ivory/85 backdrop-blur">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-red-500" /> Live · Lip-sync
                </span>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-charcoal p-4">
                <p className="font-display text-lg font-semibold text-gold">
                  Strategy = Resources × Timing
                </p>
                <p className="mt-2 text-sm text-ivory/70">
                  P(win) = (Strength + Intel) / (Risk + Uncertainty)
                </p>
                <p className="mt-4 text-[10px] uppercase tracking-wider text-ivory/35">
                  Whiteboard · KaTeX + AI illustrations
                </p>
              </div>
            </div>
          </Panel>

          {/* 09 Tutors example */}
          <Panel index="09" title="Tutors (example)">
            <div className="space-y-2.5">
              {FIGURES.slice(0, 3).map((f) => (
                <Link
                  key={f.id}
                  href={`/tutors/${f.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-obsidian/50 p-2.5 transition hover:border-gold/30"
                >
                  <img
                    src={f.imageUrl}
                    alt={f.fullName}
                    className="h-10 w-10 rounded-lg object-cover object-top"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ivory">
                      {f.fullName}
                    </p>
                    <p className="truncate text-xs text-ivory/45">{f.subject}</p>
                  </div>
                  <span style={{ color: f.accent }}>
                    <SubjectIcon id={f.icon} className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 border-t border-white/[0.06] pt-8 text-center">
          <AcademyCrest className="h-6 w-auto text-gold/70" />
          <p className="font-display text-sm italic text-ivory/55">
            The Academy — where legendary minds help you master what matters.
          </p>
        </div>
      </main>
    </div>
  );
}
