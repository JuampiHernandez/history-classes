"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { DidStreamClient, type DidStatus } from "@/lib/did-client";
import type { Figure } from "@/lib/figures";
import { VoiceWave } from "@/components/VoiceWave";
import { Whiteboard, type BoardContent } from "@/components/Whiteboard";
import { AcademyWordmark, StatusPill } from "@/components/brand";

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

type Phase = "intro" | "connecting" | "live" | "ended" | "error";
type Floor = "agent" | "user" | "open";
type Turn = { role: "user" | "ai"; text: string };

const CONVAI_MONITOR_VOLUME = 0.001;

function quietConvaiAudioElements() {
  document.querySelectorAll("audio").forEach((audio) => {
    audio.muted = false;
    audio.volume = CONVAI_MONITOR_VOLUME;
  });
}

function SessionInner({ figure }: { figure: Figure }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const didRef = useRef<DidStreamClient | null>(null);
  const sessionLiveRef = useRef(false);
  const seenMessageEventsRef = useRef(new Set<string>());

  const [phase, setPhase] = useState<Phase>("intro");
  const [didStatus, setDidStatus] = useState<DidStatus>("idle");
  const [statusText, setStatusText] = useState("Bringing the avatar to life…");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [interruptFlash, setInterruptFlash] = useState(false);
  const [hasAvatarVideo, setHasAvatarVideo] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [board, setBoard] = useState<BoardContent | null>(null);
  const [micOverride, setMicOverride] = useState<
    "none" | "user-muted" | "user-unmuted"
  >("none");
  const boardSeqRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [question, setQuestion] = useState("");

  const showOnBoard = useCallback(
    (params: Record<string, unknown>) => {
      const title = typeof params.title === "string" ? params.title.trim() : "";
      const note = typeof params.note === "string" ? params.note.trim() : "";
      const imagePrompt =
        typeof params.image_prompt === "string"
          ? params.image_prompt.trim()
          : "";
      if (!title && !note && !imagePrompt) return "nothing to show";

      boardSeqRef.current += 1;
      const boardId = boardSeqRef.current;
      const wantsImage = Boolean(imagePrompt);

      setBoard({
        id: boardId,
        title: title || figure.name,
        note,
        imageUrl: null,
        imageLoading: wantsImage,
      });

      if (wantsImage) {
        void fetch("/api/whiteboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        })
          .then(async (res) => {
            const data = (await res.json()) as {
              imageUrl?: string;
              error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Image failed");
            setBoard((prev) =>
              prev?.id === boardId
                ? {
                    ...prev,
                    imageUrl: data.imageUrl ?? null,
                    imageLoading: false,
                  }
                : prev,
            );
          })
          .catch(() => {
            setBoard((prev) =>
              prev?.id === boardId ? { ...prev, imageLoading: false } : prev,
            );
          });
      }

      return "The whiteboard now shows it for the student.";
    },
    [figure.name],
  );

  const conversation = useConversation({
    volume: CONVAI_MONITOR_VOLUME,
    onConversationCreated: (activeConversation) => {
      activeConversation.setVolume({ volume: CONVAI_MONITOR_VOLUME });
      quietConvaiAudioElements();
    },
    onMessage: (event) => {
      const { message, source } = event;
      if (!message || !sessionLiveRef.current) return;

      const eventKey =
        "event_id" in event && event.event_id !== undefined
          ? `${source}:${event.event_id}`
          : null;
      if (eventKey) {
        if (seenMessageEventsRef.current.has(eventKey)) return;
        seenMessageEventsRef.current.add(eventKey);
      }

      setTranscript((prev) => [
        ...prev,
        { role: source === "user" ? "user" : "ai", text: message },
      ]);
      if (source !== "user") {
        didRef.current?.speak(message, figure.voiceId).catch(() => {});
      }
    },
    onInterruption: () => {
      didRef.current?.clearQueue();
      setMicOverride("none");
      conversation.setMuted(false);
      setInterruptFlash(true);
      window.setTimeout(() => setInterruptFlash(false), 2200);
    },
    onError: (msg) => {
      if (!sessionLiveRef.current) {
        setErrorMsg(typeof msg === "string" ? msg : "Conversation error");
        setPhase("error");
      }
    },
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startElevenLabs = useCallback(
    (conversationToken: string) =>
      new Promise<void>((resolve, reject) => {
        conversation.startSession({
          conversationToken,
          connectionType: "webrtc",
          clientTools: { show_on_board: showOnBoard },
          onConversationCreated: (activeConversation) => {
            activeConversation.setVolume({ volume: CONVAI_MONITOR_VOLUME });
            quietConvaiAudioElements();
          },
          onConnect: () => {
            conversation.setVolume({ volume: CONVAI_MONITOR_VOLUME });
            quietConvaiAudioElements();
            resolve();
          },
          onError: (msg) =>
            reject(new Error(typeof msg === "string" ? msg : "Voice connect failed")),
        });
      }),
    [conversation, showOnBoard],
  );

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setPhase("connecting");
    setErrorMsg(null);
    sessionLiveRef.current = false;
    seenMessageEventsRef.current.clear();
    setMicOverride("none");
    setMicLevel(0);
    setHasAvatarVideo(false);
    setTranscript([]);
    setBoard(null);
    setElapsed(0);
    try {
      setStatusText("Starting lip-sync avatar…");
      const did = new DidStreamClient(videoRef.current, {
        onStatus: setDidStatus,
        onStreamEvent: (event) => {
          if (event.includes("stream/started")) {
            setHasAvatarVideo(true);
          }
        },
      });
      didRef.current = did;
      await did.connect(figure.id);

      setStatusText("Connecting your microphone…");
      const res = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId: figure.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to start agent");

      sessionLiveRef.current = true;
      await startElevenLabs(data.conversationToken);
      setPhase("live");
    } catch (err) {
      sessionLiveRef.current = false;
      setErrorMsg(err instanceof Error ? err.message : "Failed to start");
      setPhase("error");
    }
  }, [figure, startElevenLabs]);

  const end = useCallback(async () => {
    sessionLiveRef.current = false;
    seenMessageEventsRef.current.clear();
    setMicOverride("none");
    setMicLevel(0);
    setHasAvatarVideo(false);
    setPhase("ended");
    try {
      await conversation.endSession();
    } catch {
      /* ignore */
    }
    await didRef.current?.destroy();
    didRef.current = null;
  }, [conversation]);

  useEffect(() => {
    const seenMessageEvents = seenMessageEventsRef.current;
    return () => {
      sessionLiveRef.current = false;
      seenMessageEvents.clear();
      try {
        conversation.endSession();
      } catch {
        /* ignore */
      }
      void didRef.current?.destroy();
      didRef.current = null;
    };
  }, [conversation]);

  const isLive = phase === "live";
  const avatarReady =
    hasAvatarVideo && (didStatus === "ready" || didStatus === "speaking");
  const agentSpeaking =
    isLive && didStatus === "speaking";
  const userSpeaking =
    isLive &&
    !agentSpeaking &&
    !conversation.isMuted &&
    conversation.isListening;
  const micActive =
    isLive && !conversation.isMuted && (micLevel > 0.06 || conversation.isListening);
  const floor: Floor = agentSpeaking ? "agent" : userSpeaking ? "user" : "open";
  const autoMutedForAgent =
    isLive &&
    agentSpeaking &&
    conversation.isMuted &&
    micOverride !== "user-unmuted";

  useEffect(() => {
    if (!isLive || !sessionLiveRef.current) return;
    if (agentSpeaking) {
      if (micOverride !== "user-unmuted") {
        try {
          conversation.setMuted(true);
        } catch {
          /* session may already be ended */
        }
      }
      return;
    }
    if (didStatus === "ready" && micOverride !== "user-muted") {
      try {
        conversation.setMuted(false);
      } catch {
        /* session may already be ended */
      }
      if (micOverride === "user-unmuted") {
        setMicOverride("none");
      }
    }
  }, [agentSpeaking, didStatus, isLive, conversation, micOverride]);

  const handleMicToggle = useCallback(() => {
    const willMute = !conversation.isMuted;
    conversation.setMuted(willMute);
    if (willMute) {
      setMicOverride("user-muted");
    } else if (agentSpeaking) {
      setMicOverride("user-unmuted");
    } else {
      setMicOverride("none");
    }
  }, [agentSpeaking, conversation]);

  useEffect(() => {
    if (!isLive) return;
    let frame = 0;
    const tick = () => {
      setMicLevel(conversation.getInputVolume?.() ?? 0);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isLive, conversation]);

  useEffect(() => {
    if (!isLive) return;
    quietConvaiAudioElements();
    const interval = window.setInterval(quietConvaiAudioElements, 1000);
    return () => window.clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (!isLive) return;
    const interval = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [isLive]);

  const askQuestion = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = question.trim();
      if (!text || !sessionLiveRef.current) return;
      try {
        conversation.sendUserMessage(text);
        setTranscript((prev) => [...prev, { role: "user", text }]);
        setQuestion("");
      } catch {
        /* session may not be ready */
      }
    },
    [question, conversation],
  );

  const lastAiLine = [...transcript].reverse().find((t) => t.role === "ai");

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-4 sm:px-6">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <AcademyWordmark compact />
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLive && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ivory/75">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
              <span className="tabular-nums text-ivory/50">{formatClock(elapsed)}</span>
            </span>
          )}
          <StatusPill
            label={conversation.isMuted ? "Mic muted" : "Mic connected"}
            tone={conversation.isMuted ? "stone" : "gold"}
            className="hidden sm:inline-flex"
          />
          <Link
            href="/"
            onClick={() => void end()}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/40 px-4 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Leave session
          </Link>
        </div>
      </header>

      {/* Stage */}
      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.12fr]">
        {/* Avatar */}
        <div
          className={`relative min-h-[420px] overflow-hidden rounded-3xl border bg-black transition-colors duration-300 ${
            agentSpeaking
              ? "border-white/25"
              : userSpeaking
                ? "border-emerald-500/40"
                : "border-white/10"
          } ${agentSpeaking ? "avatar-speaking-ring" : ""}`}
          style={{ ["--glow-color" as string]: figure.accent }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`h-full max-h-[78vh] w-full object-cover transition-opacity duration-700 ${
              avatarReady && isLive ? "opacity-100" : "opacity-0"
            }`}
          />

          {(!avatarReady || !isLive) && (
            <img
              src={figure.imageUrl}
              alt={figure.fullName}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/40" />

          {/* Top-left LIVE + voice state */}
          {isLive && (
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ivory/85 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                Live
                <VoiceWave active={floor !== "open"} color={floor === "user" ? "#34d399" : figure.accent} />
              </span>
              {interruptFlash && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 backdrop-blur">
                  You interrupted — keep talking
                </span>
              )}
            </div>
          )}

          {/* Top-right crest */}
          <div className="absolute right-4 top-4 text-gold/70">
            <svg viewBox="0 0 100 116" width="30" height="35" fill="none" aria-hidden>
              <path d="M50 4 L92 18 V58 C92 86 72 104 50 112 C28 104 8 86 8 58 V18 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
              <rect x="33" y="34" width="34" height="4.5" rx="2.25" fill="currentColor" />
              <path d="M50 43 L36 80 H43 L46 70 H54 L57 80 H64 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Name / subject bottom-left */}
          {isLive && (
            <div className="absolute bottom-5 left-5">
              <h1 className="font-display text-2xl font-semibold text-ivory">{figure.fullName}</h1>
              <p className="text-sm text-ivory/55">{figure.subject}</p>
            </div>
          )}

          {/* Intro / connecting / ended / error overlays */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 p-8 text-center">
              {phase === "intro" && (
                <>
                  <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                    {figure.fullName}
                  </h1>
                  <p className="max-w-md text-balance text-sm text-ivory/70">
                    Face-to-face session with a <strong className="text-ivory">live
                    lip-sync avatar</strong> — lips move with every word. Allow your
                    mic, then take turns (you can always interrupt).
                  </p>
                  <button
                    onClick={start}
                    className="animate-pulse-ring rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-obsidian transition hover:brightness-105"
                    style={{ ["--ring-color" as string]: "rgba(201,164,106,0.5)" } as React.CSSProperties}
                  >
                    Start the session
                  </button>
                </>
              )}
              {phase === "connecting" && (
                <div className="flex flex-col items-center gap-3 pb-6">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-white/20"
                    style={{ borderTopColor: "var(--gold)" }}
                  />
                  <p className="text-sm text-ivory/70">{statusText}</p>
                </div>
              )}
              {phase === "ended" && (
                <div className="flex flex-col items-center gap-3 pb-6">
                  <p className="font-display text-lg font-medium">Session ended</p>
                  <button
                    onClick={start}
                    className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-obsidian"
                  >
                    Start again
                  </button>
                </div>
              )}
              {phase === "error" && (
                <div className="flex max-w-md flex-col items-center gap-3 pb-6">
                  <p className="font-display text-lg font-medium text-red-300">
                    Couldn&apos;t start the session
                  </p>
                  <p className="text-xs text-ivory/60">{errorMsg}</p>
                  <button
                    onClick={start}
                    className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-obsidian"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Live controls */}
          {isLive && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur transition ${
                  conversation.isMuted
                    ? "border-red-400/50 bg-red-500/15 text-red-200"
                    : "border-white/15 bg-black/40 text-ivory/80 hover:bg-black/60"
                }`}
              >
                {conversation.isMuted ? "Unmute" : "Mute"}
              </button>

              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition ${
                    conversation.isMuted
                      ? "bg-red-500/80 text-white"
                      : micActive
                        ? "bg-emerald-500/90 text-white"
                        : "bg-indigo text-white hover:brightness-110"
                  }`}
                  aria-label={conversation.isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {conversation.isMuted ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                      <path d="M17 17 7 7M19 11a7 7 0 0 1-7 7m-4 0H3v-2h2l3.6-3.6A7 7 0 0 1 19 11z" />
                    </svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 11a7 7 0 0 1-14 0M12 19v4M8 23h8" />
                    </svg>
                  )}
                </button>
                <p className="text-[11px] text-ivory/55">
                  {autoMutedForAgent ? "Tap to interrupt" : conversation.isMuted ? "Tap to speak" : "Tap to interrupt"}
                </p>
              </div>

              <button
                type="button"
                onClick={end}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 backdrop-blur transition hover:bg-red-500/25"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                End session
              </button>
            </div>
          )}
        </div>

        {/* Whiteboard */}
        <Whiteboard figure={figure} board={board} />
      </div>

      {/* Transcript bar + question input */}
      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-charcoal/60 px-4 py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <VoiceWave active={agentSpeaking} color={figure.accent} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/40">
                Transcript
              </p>
            </div>
            <p className="mt-1.5 truncate text-sm text-ivory/75">
              {lastAiLine ? (
                <>
                  <span style={{ color: figure.accent }} className="font-semibold">
                    {figure.name}:
                  </span>{" "}
                  {lastAiLine.text}
                </>
              ) : (
                <span className="text-ivory/35">
                  The conversation will appear here as you talk.
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-gold/80 transition hover:text-gold"
            >
              {showTranscript ? "Hide full transcript" : "View full transcript"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={showTranscript ? "rotate-180 transition" : "transition"}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          <form onSubmit={askQuestion} className="flex items-center gap-2 lg:w-80">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!isLive}
              placeholder="Ask a question…"
              className="w-full rounded-full border border-white/10 bg-obsidian/60 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none transition focus:border-gold/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isLive || !question.trim()}
              aria-label="Send question"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-obsidian transition hover:brightness-105 disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </form>
        </div>

        {showTranscript && (
          <div className="mt-3 max-h-44 overflow-y-auto border-t border-white/[0.06] pt-3">
            <div className="space-y-2">
              {transcript.length === 0 && (
                <p className="text-sm text-ivory/30">Conversation will appear here.</p>
              )}
              {transcript.map((turn, i) => (
                <div key={i} className={turn.role === "user" ? "text-right" : "text-left"}>
                  <span
                    className="inline-block max-w-full whitespace-pre-wrap break-words rounded-xl px-3 py-1.5 text-left text-sm leading-relaxed sm:max-w-[80%]"
                    style={
                      turn.role === "user"
                        ? { background: "rgba(255,255,255,0.08)" }
                        : { background: `${figure.accent}22` }
                    }
                  >
                    {turn.text}
                  </span>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function TutorClient({ figure }: { figure: Figure }) {
  return (
    <ConversationProvider>
      <SessionInner figure={figure} />
    </ConversationProvider>
  );
}
