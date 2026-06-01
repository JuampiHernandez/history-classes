"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

/** Heuristic: treat as LaTeX if it looks like math markup. */
function looksLikeLatex(text: string): boolean {
  const t = text.trim();
  if (/\\[a-zA-Z]/.test(t)) return true;
  if (/\$[^$]+\$/.test(t)) return true;
  if (/\\frac|\\sum|\\int|\\sqrt|\\alpha|\\beta|\\gamma/.test(t)) return true;
  if (/^[^=]*=.*\^/.test(t) && t.length < 120) return true;
  return false;
}

function stripDelimiters(text: string): string {
  const t = text.trim();
  if (t.startsWith("$$") && t.endsWith("$$")) return t.slice(2, -2).trim();
  if (t.startsWith("$") && t.endsWith("$") && t.length > 2) return t.slice(1, -1).trim();
  return t;
}

/** Plain fallback with simple ^ superscripts (non-LaTeX notes). */
function PlainNote({ text }: { text: string }) {
  const parts = text.split(/(\^\{[^}]+\}|\^[A-Za-z0-9]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("^")) {
          const exp = part.startsWith("^{") ? part.slice(2, -1) : part.slice(1);
          return (
            <sup key={i} className="text-[0.62em]">
              {exp}
            </sup>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function renderKatexHtml(latex: string): string | null {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
      strict: "ignore",
    });
  } catch {
    return null;
  }
}

export function BoardNote({ text }: { text: string }) {
  if (!text.trim()) return null;

  if (looksLikeLatex(text)) {
    const html = renderKatexHtml(stripDelimiters(text));
    if (html) {
      return (
        <div
          className="board-note-katex mt-4 overflow-x-auto text-neutral-800"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  return (
    <p
      className="mt-4 whitespace-pre-wrap text-2xl font-medium leading-relaxed text-neutral-800"
      style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
    >
      <PlainNote text={text} />
    </p>
  );
}
