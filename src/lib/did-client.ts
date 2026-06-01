import { formatDidError } from "@/lib/did-errors";

type DidApi = (
  payload: Record<string, unknown>,
  options?: { silent?: boolean },
) => Promise<unknown>;

async function didApi(
  payload: Record<string, unknown>,
  options?: { silent?: boolean },
): Promise<unknown> {
  const res = await fetch("/api/did", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : formatDidError(data, res.status);
    if (!options?.silent) {
      console.error("[did-client] request failed", {
        action: payload.action,
        status: res.status,
        data,
      });
    }
    throw new Error(message);
  }
  return data;
}

export type DidStatus =
  | "idle"
  | "connecting"
  | "ready"
  | "speaking"
  | "error"
  | "closed";

type Callbacks = {
  onStatus?: (status: DidStatus) => void;
  onStreamEvent?: (event: string) => void;
  onVideoReady?: () => void;
};

/**
 * Manages a single D-ID Talks Stream over WebRTC: negotiates the connection,
 * pipes the avatar video+audio into a <video> element, and lets you make the
 * avatar speak arbitrary text using an ElevenLabs voice.
 */
export class DidStreamClient {
  private pc: RTCPeerConnection | null = null;
  private streamId: string | null = null;
  private sessionId: string | null = null;
  private videoEl: HTMLVideoElement;
  private callbacks: Callbacks;
  private readonly api: DidApi = didApi;
  private isSpeaking = false;
  private videoReady = false;
  private readonly handleVideoReady = () => this.markVideoReady();
  private queuedSpeech: { text: string; voiceId: string } | null = null;
  private speakTimeout: number | null = null;

  constructor(videoEl: HTMLVideoElement, callbacks: Callbacks = {}) {
    this.videoEl = videoEl;
    this.videoEl.muted = false;
    this.callbacks = callbacks;
    this.videoEl.addEventListener("loadeddata", this.handleVideoReady);
    this.videoEl.addEventListener("canplay", this.handleVideoReady);
    this.videoEl.addEventListener("playing", this.handleVideoReady);
  }

  private setStatus(status: DidStatus) {
    this.callbacks.onStatus?.(status);
  }

  private clearSpeakTimeout() {
    if (!this.speakTimeout) return;
    window.clearTimeout(this.speakTimeout);
    this.speakTimeout = null;
  }

  private finishCurrentSpeech() {
    this.clearSpeakTimeout();
    this.isSpeaking = false;

    const next = this.queuedSpeech;
    this.queuedSpeech = null;
    if (next) {
      void this.speak(next.text, next.voiceId);
      return;
    }

    this.setStatus("ready");
  }

  private markVideoReady() {
    if (this.videoReady) return;
    this.videoReady = true;
    this.callbacks.onVideoReady?.();
  }

  private waitForVideoReady(timeoutMs = 8000): Promise<void> {
    if (this.videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.markVideoReady();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (ready: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        this.videoEl.removeEventListener("loadeddata", onReady);
        this.videoEl.removeEventListener("canplay", onReady);
        this.videoEl.removeEventListener("playing", onReady);
        if (ready) this.markVideoReady();
        resolve();
      };
      const onReady = () => done(true);

      const timeout = window.setTimeout(() => done(false), timeoutMs);
      this.videoEl.addEventListener("loadeddata", onReady, { once: true });
      this.videoEl.addEventListener("canplay", onReady, { once: true });
      this.videoEl.addEventListener("playing", onReady, { once: true });
    });
  }

  async connect(figureId: string): Promise<void> {
    this.setStatus("connecting");

    const t0 = performance.now();
    const lap = (label: string) =>
      console.info(
        `[did] ${label}: +${Math.round(performance.now() - t0)}ms`,
      );

    const created = (await this.api({
      action: "create",
      figureId,
    })) as {
      id: string;
      session_id: string;
      offer: RTCSessionDescriptionInit;
      ice_servers: RTCIceServer[];
    };
    lap("stream created (upload + create)");

    this.streamId = created.id;
    this.sessionId = created.session_id;

    const pc = new RTCPeerConnection({ iceServers: created.ice_servers });
    this.pc = pc;

    pc.addEventListener("track", (event) => {
      const [stream] = event.streams;
      if (stream && this.videoEl.srcObject !== stream) {
        this.videoEl.srcObject = stream;
        this.videoEl.play().catch(() => {
          /* autoplay may need a gesture; the page triggers connect on click */
        });
      }
    });

    pc.addEventListener("icecandidate", (event) => {
      if (event.candidate && this.streamId && this.sessionId) {
        this.api({
          action: "ice",
          streamId: this.streamId,
          sessionId: this.sessionId,
          candidate: event.candidate.toJSON(),
        }).catch(() => {});
      }
    });

    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "connected") this.setStatus("ready");
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        this.setStatus("closed");
      }
    });

    pc.addEventListener("datachannel", (event) => {
      event.channel.addEventListener("message", (msg) => {
        const text = String(msg.data ?? "");
        this.callbacks.onStreamEvent?.(text);
        if (text.includes("stream/started")) this.setStatus("speaking");
        if (text.includes("stream/done")) this.finishCurrentSpeech();
      });
    });

    await pc.setRemoteDescription(created.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await this.api({
      action: "sdp",
      streamId: this.streamId,
      sessionId: this.sessionId,
      answer: { type: answer.type, sdp: answer.sdp },
    });
    lap("sdp negotiated");

    await this.waitForVideoReady();
    lap("video ready");
  }

  async speak(text: string, voiceId: string): Promise<void> {
    if (!this.streamId || !this.sessionId) return;
    const clean = text.trim();
    if (!clean) return;

    if (this.isSpeaking) {
      this.queuedSpeech = { text: clean, voiceId };
      return;
    }

    this.isSpeaking = true;
    this.speakTimeout = window.setTimeout(() => this.finishCurrentSpeech(), 45000);

    try {
      await this.api({
        action: "speak",
        streamId: this.streamId,
        sessionId: this.sessionId,
        text: clean,
        voiceId,
      });
    } catch (error) {
      this.finishCurrentSpeech();
      throw error;
    }
  }

  clearQueue() {
    this.queuedSpeech = null;
  }

  async destroy(): Promise<void> {
    this.clearSpeakTimeout();
    this.queuedSpeech = null;
    this.isSpeaking = false;
    this.videoReady = false;
    try {
      if (this.streamId && this.sessionId) {
        await this.api(
          {
            action: "stop",
            streamId: this.streamId,
            sessionId: this.sessionId,
          },
          { silent: true },
        );
      }
    } catch {
      /* ignore */
    }
    this.pc?.close();
    this.pc = null;
    this.streamId = null;
    this.sessionId = null;
    this.videoEl.removeEventListener("loadeddata", this.handleVideoReady);
    this.videoEl.removeEventListener("canplay", this.handleVideoReady);
    this.videoEl.removeEventListener("playing", this.handleVideoReady);
    this.setStatus("closed");
  }
}
