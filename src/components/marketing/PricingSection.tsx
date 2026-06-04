"use client";

import { useState } from "react";
import { GoldButton } from "@/components/brand";
import { planMailto, schoolsPartnershipMailto } from "@/lib/contact";
import { Reveal } from "./Reveal";

const PLANS = [
  {
    id: "scholar",
    name: "Scholar",
    tagline: "Try legendary tutoring",
    monthly: 0,
    annual: 0,
    featured: false,
    cta: "Start free",
    features: [
      "2 live sessions per month",
      "1 tutor of your choice",
      "Collaborative whiteboard",
      "Session summaries",
    ],
  },
  {
    id: "plus",
    name: "Scholar Plus",
    tagline: "Unlimited exam prep",
    monthly: 14.99,
    annual: 119,
    featured: true,
    cta: "Go unlimited",
    features: [
      "Unlimited live sessions",
      "All five legendary tutors",
      "Exam tomorrow mode",
      "Whiteboard export & replay",
      "Priority voice quality",
    ],
  },
  {
    id: "family",
    name: "Family",
    tagline: "Learn together",
    monthly: 24.99,
    annual: 199,
    featured: false,
    cta: "Add learners",
    features: [
      "Up to 4 learner profiles",
      "Everything in Scholar Plus",
      "Shared progress dashboard",
      "Parent usage insights",
    ],
  },
];

function formatPrice(amount: number) {
  if (amount === 0) return "Free";
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-24 pb-20">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ivory/40">
          Pricing
        </p>
        <h2 className="mt-3 font-display display-tight max-w-2xl text-3xl font-semibold sm:text-4xl">
          Plans that fit{" "}
          <span className="italic text-gold">students & families</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/55">
          Transparent pricing inspired by leading education platforms — start
          free, upgrade when you need more sessions, or bring the whole household.
        </p>
      </Reveal>

      <Reveal delay={60} className="mt-8 flex items-center justify-center gap-4">
        <span
          className={`text-sm font-medium transition ${!annual ? "text-ivory" : "text-ivory/40"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className="pricing-toggle relative h-9 w-[4.25rem] rounded-full border border-white/10 bg-charcoal/80 p-1 transition hover:border-gold/30"
        >
          <span
            className={`pricing-toggle-knob absolute top-1 left-1 h-7 w-7 rounded-full bg-gold shadow-[0_4px_14px_-4px_rgba(201,164,106,0.8)] transition-transform duration-300 ease-out ${
              annual ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition ${annual ? "text-ivory" : "text-ivory/40"}`}
        >
          Annual
          <span className="ml-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
            Save ~33%
          </span>
        </span>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = annual ? plan.annual : plan.monthly;
          const period =
            plan.monthly === 0
              ? "forever"
              : annual
                ? "/ year"
                : "/ month";
          const monthlyEquiv =
            annual && plan.annual > 0
              ? `$${(plan.annual / 12).toFixed(2)}/mo billed yearly`
              : null;
          const mailto = planMailto(plan.name);

          return (
            <Reveal key={plan.id} delay={i * 90}>
              <article
                className={`pricing-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                  plan.featured
                    ? "border-gold/50 bg-gradient-to-b from-gold/[0.08] to-charcoal/40 shadow-[0_20px_50px_-24px_rgba(201,164,106,0.45)]"
                    : "border-white/[0.08] bg-charcoal/40 hover:border-white/[0.14]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-ivory">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-ivory/50">{plan.tagline}</p>
                <div className="mt-6">
                  <p className="font-display text-4xl font-semibold text-ivory">
                    {formatPrice(price)}
                    {plan.monthly > 0 && (
                      <span className="text-base font-normal text-ivory/45">
                        {period}
                      </span>
                    )}
                  </p>
                  {monthlyEquiv && (
                    <p className="mt-1 text-xs text-ivory/40">{monthlyEquiv}</p>
                  )}
                </div>
                <ul className="mt-6 flex-1 space-y-3 border-t border-white/[0.06] pt-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-ivory/65"
                    >
                      <svg
                        className="mt-0.5 shrink-0 text-gold"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={mailto} className="mt-8 block">
                  {plan.featured ? (
                    <GoldButton className="w-full justify-center">
                      {plan.cta}
                    </GoldButton>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-ivory transition hover:border-gold/40 hover:text-gold">
                      {plan.cta}
                    </span>
                  )}
                </a>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={100} className="mt-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo/25 bg-indigo/[0.06] p-6 sm:flex-row sm:px-8">
          <div>
            <p className="font-display text-lg font-semibold text-ivory">
              Districts & schools
            </p>
            <p className="mt-1 text-sm text-ivory/55">
              Volume licensing, SSO, rostering, and FERPA-ready deployment.
            </p>
          </div>
          <a
            href={schoolsPartnershipMailto()}
            className="shrink-0 rounded-full border border-indigo/40 px-6 py-2.5 text-sm font-semibold text-indigo transition hover:bg-indigo/15 hover:text-ivory"
          >
            Partnership for schools →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
