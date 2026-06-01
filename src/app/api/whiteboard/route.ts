import { NextRequest, NextResponse } from "next/server";
import {
  generateBoardImage,
  pollinationsBoardImageUrl,
  type BoardImageProvider,
} from "@/lib/board-image";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    const clean = prompt?.trim();
    if (!clean) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    let imageUrl: string;
    let provider: BoardImageProvider;

    try {
      const result = await generateBoardImage(clean);
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
