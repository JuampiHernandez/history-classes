import { NextRequest, NextResponse } from "next/server";
import {
  generateBoardImage,
  pollinationsBoardImageUrl,
  type BoardImageProvider,
} from "@/lib/board-image";
import { createClient } from "@/lib/supabase/server";

/**
 * AI Gateway image generation (Imagen/Gemini) routinely takes 15-40s, which
 * exceeds the default function cap. Without this the function is killed before
 * responding and the whiteboard spins forever ("Drawing illustration...").
 */
export const maxDuration = 60;

/** Leave headroom under maxDuration so the Pollinations fallback can still respond. */
const PRIMARY_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Image generation timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in.", code: "unauthenticated" },
        { status: 401 },
      );
    }

    const { prompt } = (await req.json()) as { prompt?: string };
    const clean = prompt?.trim();
    if (!clean) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    let imageUrl: string;
    let provider: BoardImageProvider;

    try {
      const result = await withTimeout(
        generateBoardImage(clean),
        PRIMARY_TIMEOUT_MS,
      );
      imageUrl = result.imageUrl;
      provider = result.provider;
    } catch (err) {
      console.warn("[whiteboard] primary provider failed, using Pollinations:", err);
      imageUrl = pollinationsBoardImageUrl(clean);
      provider = "pollinations";
    }

    return NextResponse.json({ imageUrl, provider });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
