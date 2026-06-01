export function formatDidError(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    const description = record.description;
    if (typeof description === "string") {
      const kind =
        typeof record.kind === "string" ? record.kind : "D-ID error";
      return `${kind}: ${description}`;
    }
  }
  if (typeof body === "string" && body.trim()) return body;
  return `D-ID request failed (${status})`;
}

export function didLog(
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>,
) {
  const payload = meta ? { ...meta } : undefined;
  if (level === "info") console.info(`[did] ${message}`, payload ?? "");
  else if (level === "warn") console.warn(`[did] ${message}`, payload ?? "");
  else console.error(`[did] ${message}`, payload ?? "");
}
