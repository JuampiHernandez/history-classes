import { readFile } from "node:fs/promises";
import path from "node:path";
import { didAuthHeader } from "@/lib/did-auth";
import { didLog, formatDidError } from "@/lib/did-errors";

const DID_API = "https://api.d-id.com";

/** Upload a local avatar PNG to D-ID and return the temporary source URL. */
export async function uploadFigureAvatar(figureId: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "avatars",
    `${figureId}.png`,
  );
  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    throw new Error(`Avatar file not found for figure: ${figureId}`);
  }

  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(bytes)], { type: "image/png" }),
    `${figureId}.png`,
  );

  didLog("info", "uploading avatar to D-ID", { figureId, filePath });

  const res = await fetch(`${DID_API}/images`, {
    method: "POST",
    headers: { Authorization: didAuthHeader() },
    body: form,
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    /* keep raw */
  }

  if (!res.ok) {
    didLog("error", "avatar upload failed", {
      figureId,
      status: res.status,
      body,
    });
    throw new Error(formatDidError(body, res.status));
  }

  const url = (body as { url?: string }).url;
  if (!url) {
    didLog("error", "avatar upload missing url", { figureId, body });
    throw new Error("D-ID image upload succeeded but returned no url");
  }

  didLog("info", "avatar uploaded", { figureId, url });
  return url;
}
