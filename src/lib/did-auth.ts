/** D-ID Basic auth: API key is `username:password` (password may be empty). */
export function didAuthHeader(): string {
  const key = process.env.D_ID_API_KEY;
  if (!key) throw new Error("Missing D_ID_API_KEY");
  if (key.startsWith("Basic ")) return key;
  const credential = key.includes(":") ? key : `${key}:`;
  return `Basic ${Buffer.from(credential).toString("base64")}`;
}
