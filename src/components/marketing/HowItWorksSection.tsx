import { Reveal } from "./Reveal";

const PILLARS = [
  {
    label: "Talk",
    title: "Voice-first, face-to-face",
    body: "Speak naturally. Your tutor answers in real time with lip-synced video — office hours energy, on demand.",
    icon: (
      <>
        <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
        <path d="M5 11a7 7 0 0 0 14 0" />
      </>
    ),
  },
  {
    label: "Draw",
    title: "Shared whiteboard",
    body: "Sketch proofs, diagrams, and notes together. KaTeX for math; concepts land when you build them visually.",
    icon: <path d="M12 20h9M3 20h3M4 16.5 16.5 4a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z" />,
  },
  {
    label: "Ace",
    title: "Exam-ready focus",
    body: "Exam-tomorrow mode targets weak spots. Session summaries show what to revisit before the bell rings.",
    icon: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  },
];

const CAPABILITIES = [
  {
    title: "Five legendary tutors",
    body: "Physics, history, biology, literature, logic — each adapts to your level.",
  },
  {
    title: "Live lip-sync",
    body: "Avatars that feel present, not like a chatbot behind text.",
  },
  {
    title: "Encrypted sessions",
    body: "Private by default. Built for student trust.",
  },
  {
    title: "Pick up where you left off",
    body: "Progress and follow-ups carry across sessions.",
  },
];

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </span>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 pb-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ivory/40">
          How it works
        </p>
        <h2 className="mt-3 font-display display-tight max-w-2xl text-3xl font-semibold sm:text-4xl">
          One live session.{" "}
          <span className="italic text-gold">Everything you need.</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/55">
          No long onboarding — choose a tutor, jump into voice and whiteboard, and
          leave sharper than you arrived.
        </p>
      </Reveal>

      {/* Three pillars — horizontal, no step numbers */}
      <Reveal delay={40}>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article
              key={p.label}
              className="how-pillar-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-charcoal/40 p-6 transition duration-300 hover:border-gold/30 hover:bg-charcoal/60"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/80">
                {p.label}
              </span>
              <div className="mt-4 flex items-start gap-4">
                <IconBox>{p.icon}</IconBox>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ivory">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/50">
                    {p.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      {/* Bento showcase */}
      <Reveal delay={80} className="mt-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="how-session-panel relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.08] via-charcoal/50 to-obsidian p-6 sm:p-8 lg:col-span-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo">
              Inside a session
            </p>
            <h3 className="relative mt-2 font-display text-2xl font-semibold text-ivory sm:text-3xl">
              It feels like a tutor at your desk
            </h3>
            <p className="relative mt-3 max-w-md text-sm leading-relaxed text-ivory/55">
              Voice, video, and whiteboard run together — the same loop top students
              use with human tutors, without scheduling friction.
            </p>
            <div className="relative mt-8 flex items-end justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-obsidian/70 px-6 py-8">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="voice-bar-animated w-1.5 rounded-full bg-gold"
                  style={{
                    animationDelay: `${i * 0.12}s`,
                    height: 8 + (i % 3) * 6,
                  }}
                />
              ))}
            </div>
            <p className="relative mt-4 text-center text-xs text-ivory/40">
              Real-time voice · Lip-synced avatar · Live whiteboard
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex flex-1 flex-col justify-center rounded-2xl border border-white/[0.08] bg-charcoal/40 p-6">
              <IconBox>
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20v-1a8 8 0 0 1 16 0v1" />
              </IconBox>
              <h3 className="mt-4 font-display text-lg font-semibold text-ivory">
                Choose your legendary tutor
              </h3>
              <p className="mt-2 text-sm text-ivory/50">
                Match subject and personality. They remember context and adapt to
                your exam timeline.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CAPABILITIES.slice(2).map((c) => (
                <div
                  key={c.title}
                  className="feature-card-shine rounded-2xl border border-white/[0.06] bg-obsidian/80 p-4"
                >
                  <p className="text-sm font-semibold text-ivory">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ivory/45">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
          {CAPABILITIES.slice(0, 2).map((c) => (
            <div
              key={c.title}
              className="feature-card-shine flex flex-col gap-1 bg-obsidian p-6"
            >
              <p className="text-sm font-semibold text-ivory">{c.title}</p>
              <p className="text-xs leading-relaxed text-ivory/50">{c.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
