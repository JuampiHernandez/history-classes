"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { creditsRequestMailto, displayName } from "@/lib/user-display";

type UserMenuProps = {
  initialUser: User | null;
  initialRemaining: number | null;
};

export function UserMenu({ initialUser, initialRemaining }: UserMenuProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialUser);
  const [remaining, setRemaining] = useState<number | null>(initialRemaining);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const loadUsage = async (current: User | null) => {
      if (!current) {
        setRemaining(null);
        return;
      }
      const { data } = await supabase.rpc("get_my_usage");
      if (!active) return;
      const row = data?.[0] as { remaining?: number } | undefined;
      setRemaining(typeof row?.remaining === "number" ? row.remaining : null);
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      void loadUsage(data.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const next = session?.user ?? null;
      setUser(next);
      void loadUsage(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) {
    const next = pathname && pathname !== "/login" ? pathname : "/";
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="text-sm text-ivory/70 transition hover:text-ivory"
      >
        Sign in
      </Link>
    );
  }

  const name = displayName(user);
  const creditsLabel =
    remaining === null
      ? "Loading credits…"
      : remaining === 1
        ? "1 conversation credit left"
        : `${remaining} conversation credits left`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-ivory transition hover:border-gold/40 hover:bg-gold/5"
      >
        <span className="max-w-[120px] truncate">{name}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-ivory/50 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-charcoal p-3 shadow-xl shadow-black/40"
        >
          <p className="truncate text-xs text-ivory/45">{user.email}</p>
          <p className="mt-2 text-sm font-medium text-ivory">{creditsLabel}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ivory/45">
            Each live tutoring session uses one credit.
          </p>
          <a
            role="menuitem"
            href={creditsRequestMailto(user)}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-gold px-4 py-2 text-center text-sm font-semibold text-obsidian transition hover:brightness-95"
            onClick={() => setOpen(false)}
          >
            Ask for more credits
          </a>
          <form action="/auth/signout" method="post" className="mt-2">
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-ivory/55 transition hover:bg-white/5 hover:text-ivory"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
