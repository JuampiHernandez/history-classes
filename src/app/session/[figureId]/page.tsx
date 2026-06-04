import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getFigure } from "@/lib/figures";
import TutorClient from "@/components/TutorClient";
import { createClient } from "@/lib/supabase/server";
import { getMyUsage } from "@/lib/usage";
import { AcademyWordmark } from "@/components/brand";
import { CREDITS_REQUEST_EMAIL } from "@/lib/user-display";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ figureId: string }>;
}) {
  const { figureId } = await params;
  const figure = getFigure(figureId);
  if (!figure) notFound();

  // Require sign-in: send unauthenticated visitors to login, then back here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/session/${figureId}`)}`);
  }

  // Block the session UI entirely when the user has no free conversations left.
  const usage = await getMyUsage();
  if (usage && usage.remaining <= 0) {
    return <OutOfCredits />;
  }

  return <TutorClient figure={figure} />;
}

function OutOfCredits() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <AcademyWordmark compact />
          <Link
            href="/"
            className="text-sm text-ivory/60 transition hover:text-ivory"
          >
            All tutors
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">
          You&apos;ve used your free conversations
        </h1>
        <p className="mt-3 text-balance text-sm leading-relaxed text-ivory/60">
          Your 2 free live tutoring conversations are all used up. Email us to
          request more credits.
        </p>
        <a
          href={`mailto:${CREDITS_REQUEST_EMAIL}?subject=${encodeURIComponent("More credits — The Academy")}`}
          className="mt-8 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-obsidian transition hover:brightness-105"
        >
          Ask for more credits
        </a>
        <Link
          href="/"
          className="mt-4 text-sm text-ivory/50 transition hover:text-ivory"
        >
          Back to tutors
        </Link>
      </main>
    </div>
  );
}
