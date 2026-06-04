import Link from "next/link";
import { AcademyWordmark } from "@/components/brand";
import { AuthNav } from "@/components/AuthNav";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For schools", href: "/for-schools" },
  { label: "Pricing", href: "/#pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <AcademyWordmark compact />
        <nav className="hidden items-center gap-8 text-sm text-ivory/70 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition hover:text-ivory">
              {l.label}
            </Link>
          ))}
          <AuthNav />
          <Link
            href="/#tutors"
            className="rounded-full border border-gold/50 px-5 py-2 text-sm font-semibold text-gold transition hover:bg-gold hover:text-obsidian"
          >
            Start preparing
          </Link>
        </nav>
      </div>
    </header>
  );
}
