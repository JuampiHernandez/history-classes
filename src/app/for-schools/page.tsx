import type { Metadata } from "next";
import Link from "next/link";
import {
  AcademyCrest,
  AcademyWordmark,
  GoldButton,
  StatusPill,
} from "@/components/brand";
import { Reveal } from "@/components/marketing/Reveal";
import { schoolsPartnershipMailto } from "@/lib/contact";

export const metadata: Metadata = {
  title: "For Schools — The Academy",
  description:
    "Partner with The Academy: voice-first AI tutoring, district licensing, SSO, and FERPA-ready deployment for K–12 and higher ed.",
};

const BENEFITS = [
  {
    title: "Higher engagement",
    body: "Students show up when tutoring feels human — live avatars, voice, and visual whiteboards mirror the best hybrid classrooms.",
    stat: "2.4×",
    statLabel: "avg. session length vs. text-only tools",
  },
  {
    title: "Outcomes you can measure",
    body: "Usage dashboards, topic mastery signals, and session analytics align with MTSS and intervention workflows.",
    stat: "87%",
    statLabel: "of pilots report clearer gap identification",
  },
  {
    title: "Safe by design",
    body: "Encrypted sessions, role-based access, optional content filters, and deployment models built for student privacy.",
    stat: "FERPA",
    statLabel: "aligned architecture & DPA available",
  },
];

const PARTNER_FEATURES = [
  "Unlimited seats with volume pricing",
  "Google Classroom & Clever rostering",
  "SSO (Google, Microsoft, SAML)",
  "Admin dashboard & usage exports",
  "Custom tutor personas per subject",
  "Dedicated success manager",
  "Pilot program (4–8 weeks)",
  "Professional development for staff",
];

const TIMELINE = [
  { phase: "Week 1–2", title: "Discovery & pilot design", body: "Align on subjects, grades, and success metrics with your curriculum team." },
  { phase: "Week 3–6", title: "Pilot with cohorts", body: "Roll out to selected classes; weekly check-ins and usage reviews." },
  { phase: "Week 7+", title: "Scale district-wide", body: "Procurement, SSO at scale, and ongoing instructional coaching." },
];

export default function ForSchoolsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <AcademyWordmark compact />
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
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        {/* Hero */}
        <section className="relative grid grid-cols-1 items-center gap-10 overflow-hidden py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="partnership-orb pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-indigo/15 blur-3xl" />
          <div className="partnership-orb partnership-orb--gold pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative animate-float-in">
            <StatusPill label="K–12 & higher ed partnerships" tone="indigo" className="mb-6" />
            <h1 className="font-display display-tight max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
              Bring legendary tutors to{" "}
              <span className="italic text-gold">every classroom</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/60">
              The Academy partners with schools and districts to deliver
              voice-first, avatar-led tutoring at scale — with the security,
              rostering, and analytics your team expects.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={schoolsPartnershipMailto()}>
                <GoldButton>Request a pilot</GoldButton>
              </a>
              <Link
                href="/#pricing"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-ivory/80 transition hover:border-gold/40 hover:text-ivory"
              >
                View individual plans
              </Link>
            </div>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="absolute h-64 w-64 rounded-full bg-indigo/10 blur-3xl" />
            <AcademyCrest className="crest-shimmer relative h-52 w-auto text-gold/70" />
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ivory/40">
              Why districts partner with us
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <article className="stat-card-rise flex h-full flex-col rounded-2xl border border-white/[0.08] bg-charcoal/40 p-6 transition hover:border-gold/25">
                  <p className="font-display text-3xl font-semibold text-gold">{b.stat}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-ivory/40">
                    {b.statLabel}
                  </p>
                  <h2 className="mt-5 font-display text-lg font-semibold text-ivory">
                    {b.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ivory/50">
                    {b.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section className="pb-20">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">
              Everything in <span className="italic text-gold">Scholar Plus</span>, built for institutions
            </h2>
            <p className="mt-3 max-w-lg text-sm text-ivory/55">
              Comparable to district bundles from leading ed-tech platforms — without
              sacrificing the live, conversational experience students love.
            </p>
          </Reveal>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PARTNER_FEATURES.map((f, i) => (
              <Reveal
                key={f}
                delay={i * 40}
                as="li"
                className="flex list-none items-center gap-3 rounded-xl border border-white/[0.06] bg-obsidian/50 px-4 py-3.5 text-sm text-ivory/75 transition hover:border-indigo/30 hover:bg-indigo/[0.04]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo/15 text-indigo">
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
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {f}
              </Reveal>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section className="pb-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ivory/40">
              Partnership journey
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              From pilot to district-wide in weeks
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.phase} delay={i * 120}>
                <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-charcoal/30 p-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo">
                    {t.phase}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ivory">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/50">{t.body}</p>
                  <div
                    className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-white/[0.04]"
                    aria-hidden
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal>
          <section className="mb-20 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.12] via-charcoal/50 to-obsidian p-8 text-center sm:p-12">
            <span className="mx-auto inline-block animate-pulse-ring rounded-full">
              <AcademyCrest className="h-12 w-auto text-gold" />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">
              Ready to run a pilot this semester?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ivory/55">
              Tell us your district size, subjects, and timeline. We&apos;ll tailor a
              partnership proposal within two business days.
            </p>
            <a href={schoolsPartnershipMailto()} className="mt-8 inline-block">
              <GoldButton>Contact partnerships</GoldButton>
            </a>
          </section>
        </Reveal>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center">
        <AcademyCrest className="h-7 w-auto text-gold/70" />
        <p className="font-display text-sm italic text-ivory/50">
          Where legendary minds help you master what matters.
        </p>
      </footer>
    </div>
  );
}
