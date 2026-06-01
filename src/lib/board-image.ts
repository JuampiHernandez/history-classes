import { createOpenAI } from "@ai-sdk/openai";
import { generateImage, generateText } from "ai";

/** Keyless Pollinations URL used when no paid provider is configured or all fail. */
export function pollinationsBoardImageUrl(prompt: string): string {
  const styled = `${prompt}. Clean educational illustration, clearly labeled, on a plain white background, textbook diagram style, crisp lines, high detail, no text watermark`;
  const seed = Math.floor(Math.random() * 1_000_000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    styled,
  )}?width=896&height=896&nologo=true&model=flux&seed=${seed}`;
}

export type BoardImageProvider =
  | "gateway-gemini"
  | "openai"
  | "gemini-direct"
  | "pollinations";

const GATEWAY_GEMINI_MODEL = "google/gemini-3.1-flash-image-preview";
const OPENAI_IMAGE_MODEL = "gpt-image-1";

function boardImagePrompt(prompt: string): string {
  return `Create a single educational illustration for a tutoring whiteboard: ${prompt}. Style: clean textbook diagram on plain white background, clearly labeled parts, crisp lines, accurate historical or scientific detail where relevant, no watermark.`;
}

/** True on Vercel production deploys — use AI Gateway + Gemini there. */
export function shouldUseGatewayForBoardImages(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function fileToDataUrl(file: {
  base64?: string;
  uint8Array?: Uint8Array;
  mediaType?: string;
}): string | null {
  const mime = file.mediaType ?? "image/png";
  if (file.base64) return `data:${mime};base64,${file.base64}`;
  if (file.uint8Array) {
    const b64 = Buffer.from(file.uint8Array).toString("base64");
    return `data:${mime};base64,${b64}`;
  }
  return null;
}

/**
 * Production: Gemini image via Vercel AI Gateway (OIDC on Vercel, or
 * AI_GATEWAY_API_KEY / VERCEL_OIDC_TOKEN from `vercel env pull` locally).
 */
export async function generateBoardImageWithGateway(
  prompt: string,
): Promise<{ imageUrl: string; provider: "gateway-gemini" }> {
  const result = await generateText({
    model: GATEWAY_GEMINI_MODEL,
    prompt: boardImagePrompt(prompt),
  });

  const imageFiles = result.files.filter((f) =>
    f.mediaType?.startsWith("image/"),
  );
  for (const file of imageFiles) {
    const url = fileToDataUrl(file);
    if (url) return { imageUrl: url, provider: "gateway-gemini" };
  }

  throw new Error("AI Gateway returned no image file");
}

/** Local dev: OpenAI image generation with OPENAI_API_KEY (direct, not gateway). */
export async function generateBoardImageWithOpenAI(
  prompt: string,
): Promise<{ imageUrl: string; provider: "openai" }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const openai = createOpenAI({ apiKey: key });
  const { image } = await generateImage({
    model: openai.image(OPENAI_IMAGE_MODEL),
    prompt: boardImagePrompt(prompt),
    size: "1024x1024",
  });

  const url = fileToDataUrl(image);
  if (!url) throw new Error("OpenAI returned no image data");
  return { imageUrl: url, provider: "openai" };
}

export function geminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    undefined
  );
}

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";

/** Optional fallback: direct Gemini API key (bypasses gateway). */
export async function generateBoardImageWithGeminiDirect(
  prompt: string,
): Promise<{ imageUrl: string; provider: "gemini-direct" }> {
  const key = geminiApiKey();
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const res = await fetch(
    `${GEMINI_API}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: boardImagePrompt(prompt) }] },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "1:1" },
        },
      }),
    },
  );

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
        }>;
      };
    }>;
  };

  if (!res.ok) {
    throw new Error(
      data.error?.message ?? `Gemini image failed (${res.status})`,
    );
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      const mime = inline.mimeType ?? "image/png";
      return {
        imageUrl: `data:${mime};base64,${inline.data}`,
        provider: "gemini-direct",
      };
    }
  }

  throw new Error("Gemini returned no image data");
}

/** Pick provider: gateway+Gemini in production, OpenAI in dev, then fallbacks. */
export async function generateBoardImage(
  prompt: string,
): Promise<{ imageUrl: string; provider: BoardImageProvider }> {
  if (shouldUseGatewayForBoardImages()) {
    return generateBoardImageWithGateway(prompt);
  }

  if (process.env.OPENAI_API_KEY) {
    return generateBoardImageWithOpenAI(prompt);
  }

  if (geminiApiKey()) {
    return generateBoardImageWithGeminiDirect(prompt);
  }

  throw new Error(
    "No image provider configured (OPENAI_API_KEY for dev, or AI Gateway on production)",
  );
}
