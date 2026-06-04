import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AcademyCrest, AcademyWordmark } from "@/components/brand";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(safeNext);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <AcademyWordmark compact />
          <Link
            href="/"
            className="text-sm text-ivory/60 transition hover:text-ivory"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <AcademyCrest className="h-14 w-auto text-gold/80" />
        <h1 className="mt-6 font-display text-3xl font-semibold">
          Sign in to The Academy
        </h1>
        <p className="mt-3 text-balance text-sm leading-relaxed text-ivory/60">
          Create a free account to start learning with legendary tutors. Every
          new member gets <strong className="text-gold">2 free live
          conversations</strong> with any tutor.
        </p>

        <div className="mt-8 w-full">
          <GoogleSignIn next={safeNext} />
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            Something went wrong signing you in. Please try again.
          </p>
        )}

        <p className="mt-8 max-w-xs text-[11px] leading-relaxed text-ivory/35">
          We only use your account to track your free conversations and keep
          your sessions secure.
        </p>
      </main>
    </div>
  );
}
