import Link from "next/link";
import { FIGURES } from "@/lib/figures";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12 sm:py-16">
      <header className="animate-float-in flex flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live lip-sync avatars · D-ID × ElevenLabs
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Office Hours at{" "}
          <span className="bg-gradient-to-r from-[#6ea8fe] via-[#c08bff] to-[#74c69d] bg-clip-text text-transparent">
            The Academy
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-base text-white/60 sm:text-lg">
          Your exam is tomorrow. Five legendary tutors — physics, history,
          biology, literature, and logic — are waiting. Pick one and talk
          face-to-face while they teach you live.
        </p>
      </header>

      <section className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FIGURES.map((figure, i) => (
          <Link
            key={figure.id}
            href={`/session/${figure.id}`}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-float-in group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-1 transition duration-300 hover:-translate-y-1 hover:border-white/25"
          >
            <div className="relative overflow-hidden rounded-[20px]">
              <img
                src={figure.imageUrl}
                alt={figure.fullName}
                className="aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div
                className="absolute inset-x-0 bottom-0 h-1"
                style={{ backgroundColor: figure.accent }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: figure.accent }}
                >
                  {figure.subject}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {figure.fullName}
                </h2>
                <p className="mt-1 text-sm text-white/60">{figure.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur transition group-hover:bg-white group-hover:text-black">
                  Start session
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
            </div>
          </Link>
        ))}
      </section>

      <footer className="mt-16 text-center text-xs text-white/30">
        Built for ElevenHacks · D-ID + ElevenAgents
      </footer>
    </main>
  );
}
