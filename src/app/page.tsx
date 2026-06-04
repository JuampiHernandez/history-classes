import Link from "next/link";
import { FIGURES } from "@/lib/figures";
import {
  AcademyCrest,
  GoldButton,
  StatusPill,
  SubjectIcon,
} from "@/components/brand";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-float-in">
            <StatusPill label="Live lip-sync tutoring" tone="indigo" className="mb-7" />
            <h1 className="font-display display-tight text-5xl font-semibold sm:text-6xl">
              Tomorrow&apos;s exam.
              <br />
              <span className="italic text-gold">Legendary minds.</span>
            </h1>
            <p className="mt-6 max-w-md text-balance text-base leading-relaxed text-ivory/60">
              Five legendary tutors — physics, history, biology, literature, and
              logic — are waiting. Pick one and prepare live, face-to-face with
              voice.
            </p>
            <Link href="#tutors" className="mt-8 inline-block">
              <GoldButton>Choose your tutor</GoldButton>
            </Link>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="absolute h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <AcademyCrest className="crest-shimmer relative h-80 w-auto text-gold/80" />
          </div>
        </section>

        {/* Tutors */}
        <section id="tutors" className="scroll-mt-24 pb-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-ivory/40">
            Meet your tutors
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FIGURES.map((figure, i) => (
              <Link
                key={figure.id}
                href={`/tutors/${figure.id}`}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-float-in group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-charcoal/60 transition duration-300 hover:-translate-y-1 hover:border-gold/40"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={figure.imageUrl}
                    alt={figure.fullName}
                    className="aspect-[3/4] w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal to-transparent" />
                  <div
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 backdrop-blur"
                    style={{ color: figure.accent }}
                  >
                    <SubjectIcon id={figure.icon} className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col px-4 pb-4">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: figure.accent }}
                  >
                    {figure.discipline}
                  </p>
                  <h2 className="mt-1 font-display text-base font-semibold leading-tight text-ivory">
                    {figure.fullName}
                  </h2>
                  <span className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-ivory/60 transition group-hover:border-gold group-hover:text-gold">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <HowItWorksSection />
        <PricingSection />
      </main>

      <footer className="mx-auto mt-16 flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
        <AcademyCrest className="h-7 w-auto text-gold/70" />
        <p className="font-display text-sm italic text-ivory/50">
          Where legendary minds help you master what matters.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ivory/30">
          <Link href="/for-schools" className="transition hover:text-ivory/60">
            For schools
          </Link>
          <span>·</span>
          <Link href="/brand" className="transition hover:text-ivory/60">
            Brand
          </Link>
          <span>·</span>
          <span>Built for ElevenHacks · D-ID × ElevenLabs</span>
        </div>
      </footer>
    </div>
  );
}
