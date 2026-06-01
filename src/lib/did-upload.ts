import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { didAuthHeader } from "@/lib/did-auth";
import { didLog, formatDidError } from "@/lib/did-errors";

const DID_API = "https://api.d-id.com";

/**
 * Avatar source PNGs are ~2MB at 1536x1024. Uploading and having D-ID run face
 * detection on a file that large is the dominant cost of starting a session
 * (~12s observed). D-ID only needs a clear frontal face, so downscale to a
 * modest width and re-encode as JPEG before uploading — this shrinks the file
 * ~50x and cuts upload + processing time dramatically.
 */
const UPLOAD_MAX_WIDTH = 720;
const UPLOAD_JPEG_QUALITY = 85;

/**
 * D-ID stores uploaded images and returns a stable, reusable URL. Re-uploading
 * the same avatar on every session forces D-ID to re-process the face each
 * time, which slows down stream creation. Cache the resulting URL per figure
 * for the lifetime of the server process so repeat sessions skip the upload.
 */
const uploadCache = new Map<string, string>();

/** Upload a local avatar PNG to D-ID and return the (cached) source URL. */
export async function uploadFigureAvatar(figureId: string): Promise<string> {
  const cached = uploadCache.get(figureId);
  if (cached) {
    didLog("info", "reusing cached D-ID avatar", { figureId, url: cached });
    return cached;
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    "avatars",
    `${figureId}.png`,
  );
  let original: Buffer;
  try {
    original = await readFile(filePath);
  } catch {
    throw new Error(`Avatar file not found for figure: ${figureId}`);
  }

  let bytes: Buffer;
  let contentType = "image/jpeg";
  let fileName = `${figureId}.jpg`;
  try {
    bytes = await sharp(original)
      .resize({ width: UPLOAD_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: UPLOAD_JPEG_QUALITY })
      .toBuffer();
  } catch (err) {
    // If resizing fails for any reason, fall back to the original PNG.
    didLog("error", "avatar resize failed, uploading original", {
      figureId,
      message: err instanceof Error ? err.message : String(err),
    });
    bytes = original;
    contentType = "image/png";
    fileName = `${figureId}.png`;
  }

  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(bytes)], { type: contentType }),
    fileName,
  );

  didLog("info", "uploading avatar to D-ID", {
    figureId,
    filePath,
    bytes: bytes.length,
    originalBytes: original.length,
  });

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
  uploadCache.set(figureId, url);
  return url;
}
