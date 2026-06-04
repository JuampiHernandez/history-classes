import type { User } from "@supabase/supabase-js";

/** First name or email local-part for header display (e.g. "juampi"). */
export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.given_name === "string" && meta.given_name);
  if (full) return full.trim().split(/\s+/)[0] ?? full;
  if (user.email) return user.email.split("@")[0] ?? "Account";
  return "Account";
}

export const CREDITS_REQUEST_EMAIL = "juampi.contact@gmail.com";

export function creditsRequestMailto(user: User): string {
  const name = displayName(user);
  const subject = "More credits — The Academy";
  const body = `Hi,

I'd like more conversation credits for my account.

Name: ${name}
Email: ${user.email ?? "(unknown)"}

Thanks!`;
  return `mailto:${CREDITS_REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
