"use client";

import { useState } from "react";
import type { Figure } from "@/lib/figures";
import { BoardNote } from "@/components/BoardNote";

export type BoardContent = {
  id: number;
  title: string;
  note: string;
  imageUrl: string | null;
  /** True while /api/whiteboard is generating an illustration. */
  imageLoading?: boolean;
};

function BoardImage({
  url,
  alt,
  accent,
}: {
  url: string;
  alt: string;
  accent: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  if (state === "error") return null;

  return (
    <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/[0.03]">
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300"
            style={{ borderTopColor: accent }}
          />
          <p className="text-xs text-neutral-400">Drawing…</p>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={`max-h-full max-w-full rounded-xl object-contain transition-opacity duration-500 ${
          state === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function BoardImageLoading({ accent }: { accent: string }) {
  return (
    <div className="relative mt-4 flex min-h-[12rem] flex-1 items-center justify-center rounded-xl bg-black/[0.03]">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300"
          style={{ borderTopColor: accent }}
        />
        <p className="text-xs text-neutral-400">Drawing illustration…</p>
      </div>
    </div>
  );
}

export function Whiteboard({
  figure,
  board,
}: {
  figure: Figure;
  board: BoardContent | null;
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#f7f6f1] text-neutral-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-black/10 bg-white/60 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: figure.accent }}
          />
          Whiteboard
        </span>
        {board && (
          <span className="max-w-[60%] truncate text-xs font-medium text-neutral-400">
            {figure.name}
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        {!board && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-neutral-300"
            >
              <path d="M12 20h9M3 20h3M4 16.5 16.5 4a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z" />
            </svg>
            <p className="mt-3 max-w-[16rem] text-sm text-neutral-400">
              {figure.name} will sketch formulas, diagrams and pictures here
              while teaching.
            </p>
          </div>
        )}

        {board && (
          <div key={board.id} className="animate-float-in flex flex-1 flex-col">
            <h3
              className="text-lg font-semibold leading-snug"
              style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
            >
              {board.title}
            </h3>
            <div
              className="mt-1 h-0.5 w-12 rounded-full"
              style={{ backgroundColor: figure.accent }}
            />

            {board.note && <BoardNote text={board.note} />}

            {board.imageLoading && !board.imageUrl && (
              <BoardImageLoading accent={figure.accent} />
            )}

            {board.imageUrl && (
              <BoardImage
                key={`${board.id}-${board.imageUrl.slice(0, 48)}`}
                url={board.imageUrl}
                alt={board.title}
                accent={figure.accent}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
