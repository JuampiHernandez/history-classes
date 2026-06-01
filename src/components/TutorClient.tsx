"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { DidStreamClient, type DidStatus } from "@/lib/did-client";
import type { Figure } from "@/lib/figures";
import { VoiceWave } from "@/components/VoiceWave";
import { Whiteboard, type BoardContent } from "@/components/Whiteboard";

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
    try {
      await conversation.endSession();
    } catch {
      /* ignore */
    }
    await didRef.current?.destroy();
    didRef.current = null;
    setPhase("ended");
  }, [conversation]);

  useEffect(() => {
    const seenMessageEvents = seenMessageEventsRef.current;
    return () => {
      sessionLiveRef.current = false;
      seenMessageEvents.clear();
      didRef.current?.destroy();
    };
  }, []);

  const isLive = phase === "live";
  const showBoard = isLive || phase === "ended";
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
    if (!isLive) return;
    if (agentSpeaking) {
      if (micOverride !== "user-unmuted") {
        conversation.setMuted(true);
      }
      return;
    }
    if (didStatus === "ready" && micOverride !== "user-muted") {
      conversation.setMuted(false);
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

  const floorLabel =
    floor === "agent"
      ? autoMutedForAgent
        ? `${figure.name} is speaking — mic muted`
        : `${figure.name} is speaking`
      : floor === "user"
        ? "Your turn — speak now"
        : conversation.isMuted
          ? "Mic muted"
          : "Listening…";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All tutors
        </Link>
        <div className="text-right">
          <p className="text-sm font-semibold">{figure.fullName}</p>
          <p className="text-xs text-white/50">{figure.subject}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div
          className={
            showBoard
              ? "grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]"
              : "contents"
          }
        >
        {/* Avatar stage — primary focus */}
        <div
          className={`relative overflow-hidden rounded-3xl border bg-black transition-colors duration-300 ${
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
            className={`h-[min(72vh,640px)] w-full object-cover transition-opacity duration-700 ${
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

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />

          {isLive && (
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
                Live lip-sync avatar
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-full border bg-black/45 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
                style={{
                  borderColor:
                    floor === "agent"
                      ? `${figure.accent}55`
                      : floor === "user"
                        ? "rgba(52,211,153,0.35)"
                        : "rgba(255,255,255,0.14)",
                  color:
                    floor === "agent"
                      ? figure.accent
                      : floor === "user"
                        ? "#86efac"
                        : undefined,
                }}
              >
                <VoiceWave
                  active={floor !== "open"}
                  color={floor === "user" ? "#34d399" : figure.accent}
                />
                {floorLabel}
              </span>
              {interruptFlash && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 backdrop-blur">
                  You interrupted — keep talking
                </span>
              )}
            </div>
          )}

          {/* Intro / connecting / ended / error overlays */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 p-8 text-center">
              {phase === "intro" && (
                <>
                  <h1 className="text-3xl font-semibold sm:text-4xl">
                    {figure.fullName}
                  </h1>
                  <p className="max-w-md text-balance text-sm text-white/70">
                    Face-to-face session with a <strong className="text-white">live
                    animated avatar</strong> — lips move with every word. Allow
                    your mic, then take turns (you can always interrupt).
                  </p>
                  <button
                    onClick={start}
                    className="animate-pulse-ring rounded-full px-7 py-3.5 text-base font-semibold text-black transition hover:brightness-110"
                    style={
                      {
                        backgroundColor: figure.accent,
                        ["--ring-color" as string]: figure.accent,
                      } as React.CSSProperties
                    }
                  >
                    Start the session
                  </button>
                </>
              )}
              {phase === "connecting" && (
                <div className="flex flex-col items-center gap-3 pb-6">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-white/20"
                    style={{ borderTopColor: figure.accent }}
                  />
                  <p className="text-sm text-white/70">{statusText}</p>
                </div>
              )}
              {phase === "ended" && (
                <div className="flex flex-col items-center gap-3 pb-6">
                  <p className="text-lg font-medium">Session ended</p>
                  <button
                    onClick={start}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black"
                  >
                    Start again
                  </button>
                </div>
              )}
              {phase === "error" && (
                <div className="flex max-w-md flex-col items-center gap-3 pb-6">
                  <p className="text-lg font-medium text-red-300">
                    Couldn&apos;t start the session
                  </p>
                  <p className="text-xs text-white/60">{errorMsg}</p>
                  <button
                    onClick={start}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Live controls */}
          {isLive && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-5">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg transition ${
                  conversation.isMuted
                    ? "border-red-400/60 bg-red-500/25 text-red-100"
                    : micActive
                      ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                      : "border-white/25 bg-white/15 text-white"
                }`}
                aria-label={conversation.isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {conversation.isMuted ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                    <path d="M17 17 7 7M19 11a7 7 0 0 1-7 7m-4 0H3v-2h2l3.6-3.6A7 7 0 0 1 19 11z" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 11a7 7 0 0 1-14 0M12 19v4M8 23h8" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-white/50">
                {autoMutedForAgent
                  ? "Mic auto-muted — tap to interrupt"
                  : conversation.isMuted
                    ? "Mic muted — tap to speak"
                    : "Tap to mute your mic"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
                >
                  {showTranscript ? "Hide transcript" : "Show transcript"}
                </button>
                <button
                  type="button"
                  onClick={end}
                  className="rounded-full bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  End session
                </button>
              </div>
            </div>
          )}
        </div>

          {showBoard && <Whiteboard figure={figure} board={board} />}
        </div>

        {/* Optional transcript drawer */}
        {showTranscript && (
          <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              Transcript
            </p>
            <div className="space-y-2">
              {transcript.length === 0 && (
                <p className="text-sm text-white/30">Conversation will appear here.</p>
              )}
              {transcript.map((turn, i) => (
                <div
                  key={i}
                  className={turn.role === "user" ? "text-right" : "text-left"}
                >
                  <span
                    className="inline-block max-w-full whitespace-pre-wrap break-words rounded-xl px-3 py-1.5 text-left text-sm leading-relaxed sm:max-w-[90%]"
                    style={
                      turn.role === "user"
                        ? { background: "rgba(255,255,255,0.08)" }
                        : {
                            background: `${figure.accent}22`,
                          }
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

        {/* Compact persona strip */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-white/50">
            <span style={{ color: figure.accent }} className="font-semibold">
              {figure.era}
            </span>
            {" · "}
            {figure.tagline}
          </p>
        </div>
      </div>
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
