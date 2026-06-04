export const ACADEMY_CONTACT_EMAIL = "juampi.contact@gmail.com";

export function contactMailto(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${ACADEMY_CONTACT_EMAIL}?${params.toString()}`;
}

export function planMailto(planName: string): string {
  return contactMailto(
    `The Academy — ${planName}`,
    `Hi,\n\nI'd like to get started with the ${planName} plan.\n\nThanks!`,
  );
}

export function schoolsPartnershipMailto(): string {
  return contactMailto(
    "The Academy — School partnership",
    "Hi,\n\nI'm interested in a school or district partnership with The Academy.\n\nOrganization:\nRole:\nEstimated learners:\n\nThanks!",
  );
}
