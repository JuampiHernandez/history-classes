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
    <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/[0.03]">
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-white/15"
            style={{ borderTopColor: accent }}
          />
          <p className="text-xs text-ivory/40">Drawing…</p>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        className={`h-full max-h-full max-w-full rounded-xl bg-white object-contain transition-opacity duration-500 ${
          state === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function BoardImageLoading({ accent }: { accent: string }) {
  return (
    <div className="relative mt-4 flex min-h-[12rem] flex-1 items-center justify-center rounded-xl bg-white/[0.03]">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-white/15"
          style={{ borderTopColor: accent }}
        />
        <p className="text-xs text-ivory/40">Drawing illustration…</p>
      </div>
    </div>
  );
}

const TOOLS = [
  { id: "pen", path: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19 3 20l1-4z" },
  { id: "erase", path: "M3 17 10 10l5 5-4 4H7zM13 7l4-4 4 4-4 4" },
  { id: "highlight", path: "M9 11l3 3 8-8-3-3zM5 19l3-1 8-8M5 19l-2 2" },
  { id: "text", path: "M4 7V5h16v2M9 19h6M12 5v14" },
  { id: "arrow", path: "M7 17 17 7M9 7h8v8" },
  { id: "pointer", path: "M6 3l14 9-7 1-2 7z" },
  { id: "shapes", path: "M4 6h8v8H4zM14 14h6v6h-6zM17 4l3 5h-6z" },
];

export function Whiteboard({
  figure,
  board,
}: {
  figure: Figure;
  board: BoardContent | null;
}) {
  const [active, setActive] = useState("pen");
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-charcoal text-ivory shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              aria-label={t.id}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                active === t.id
                  ? "bg-indigo/20 text-indigo"
                  : "text-ivory/50 hover:bg-white/5 hover:text-ivory"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={t.path} />
              </svg>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="mx-1 h-5 w-px bg-white/10" />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/50 transition hover:bg-white/5 hover:text-ivory"
            aria-label="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6M3 13a9 9 0 1 0 3-7" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/50 transition hover:bg-white/5 hover:text-ivory"
            aria-label="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6M21 13a9 9 0 1 1-3-7" />
            </svg>
          </button>
          <button
            type="button"
            className="ml-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-ivory/60 transition hover:text-ivory"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <div
          className="flex flex-1 flex-col origin-top-left transition-transform"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {!board && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ivory/15"
              >
                <path d="M12 20h9M3 20h3M4 16.5 16.5 4a2.1 2.1 0 0 1 3 3L7 19.5l-4 1z" />
              </svg>
              <p className="mt-3 max-w-[16rem] text-sm text-ivory/35">
                {figure.name} will sketch formulas, diagrams and pictures here
                while teaching.
              </p>
            </div>
          )}

          {board && (
            <div key={board.id} className="animate-float-in flex min-h-0 flex-1 flex-col">
              <h3 className="font-display text-xl font-semibold leading-snug text-gold">
                {board.title}
              </h3>
              <div
                className="mt-1 h-0.5 w-12 rounded-full"
                style={{ backgroundColor: figure.accent }}
              />

              {board.note && (
                <div className="text-ivory">
                  <BoardNote text={board.note} />
                </div>
              )}

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

        {/* Zoom controls */}
        <div className="pointer-events-auto absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-white/10 bg-obsidian/70 px-1.5 py-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/60 transition hover:text-ivory"
            aria-label="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <span className="w-10 text-center text-xs font-medium text-ivory/60">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(160, z + 10))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/60 transition hover:text-ivory"
            aria-label="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/60 transition hover:text-ivory"
            aria-label="Reset zoom"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
