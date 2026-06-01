import { NextRequest, NextResponse } from "next/server";
import { didAuthHeader } from "@/lib/did-auth";
import { didLog, formatDidError } from "@/lib/did-errors";
import { uploadFigureAvatar } from "@/lib/did-upload";

const DID_API = "https://api.d-id.com";
const DID_OUTPUT_RESOLUTION = 1280;
const DID_COMPATIBILITY_MODE = "off"; // Prefer H264 where supported.
const DID_TALK_CONFIG = {
  stitch: true,
  fluent: true,
  pad_audio: 0.2,
} as const;
const ELEVENLABS_VOICE_CONFIG = {
  stability: 0.65,
  similarity_boost: 0.85,
  use_speaker_boost: true,
  apply_text_normalization: "auto",
} as const;

function elevenExternalHeader() {
  const key = process.env.ELEVENLABS_API_KEY;
  return key ? JSON.stringify({ elevenlabs: key }) : undefined;
}

async function didFetch(path: string, init: RequestInit, action?: string) {
  const res = await fetch(`${DID_API}${path}`, {
    ...init,
    headers: {
      Authorization: didAuthHeader(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    /* keep raw text */
  }

  if (!res.ok) {
    didLog("error", "upstream D-ID request failed", {
      action,
      path,
      status: res.status,
      body,
    });
  }

  return { ok: res.ok, status: res.status, body };
}

function jsonFromDid(
  result: { ok: boolean; status: number; body: unknown },
  action: string,
) {
  if (result.ok) return NextResponse.json(result.body, { status: result.status });

  return NextResponse.json(
    {
      error: formatDidError(result.body, result.status),
      did: result.body,
      action,
    },
    { status: result.status },
  );
}

export async function POST(req: NextRequest) {
  let action = "unknown";
  try {
    const payload = await req.json();
    action = (payload as { action: string }).action;

    switch (action) {
      case "create": {
        const { sourceUrl, figureId } = payload as {
          sourceUrl?: string;
          figureId?: string;
        };

        let resolvedSource = sourceUrl;
        if (figureId) {
          resolvedSource = await uploadFigureAvatar(figureId);
        }
        if (!resolvedSource) {
          return NextResponse.json(
            { error: "create requires figureId or sourceUrl" },
            { status: 400 },
          );
        }

        didLog("info", "creating talks stream", {
          figureId: figureId ?? null,
          sourceUrl: resolvedSource,
        });

        const r = await didFetch(
          "/talks/streams",
          {
            method: "POST",
            body: JSON.stringify({
              source_url: resolvedSource,
              stream_warmup: true,
              compatibility_mode: DID_COMPATIBILITY_MODE,
              output_resolution: DID_OUTPUT_RESOLUTION,
              config: { stitch: true },
            }),
          },
          action,
        );
        return jsonFromDid(r, action);
      }

      case "sdp": {
        const { streamId, answer, sessionId } = payload as {
          streamId: string;
          answer: RTCSessionDescriptionInit;
          sessionId: string;
        };
        const r = await didFetch(
          `/talks/streams/${streamId}/sdp`,
          {
            method: "POST",
            body: JSON.stringify({ answer, session_id: sessionId }),
          },
          action,
        );
        return jsonFromDid(r, action);
      }

      case "ice": {
        const { streamId, candidate, sessionId } = payload as {
          streamId: string;
          candidate: RTCIceCandidateInit;
          sessionId: string;
        };
        const r = await didFetch(
          `/talks/streams/${streamId}/ice`,
          {
            method: "POST",
            body: JSON.stringify({
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
              session_id: sessionId,
            }),
          },
          action,
        );
        return jsonFromDid(r, action);
      }

      case "speak": {
        const { streamId, sessionId, text, voiceId } = payload as {
          streamId: string;
          sessionId: string;
          text: string;
          voiceId: string;
        };
        const external = elevenExternalHeader();
        const r = await didFetch(
          `/talks/streams/${streamId}`,
          {
            method: "POST",
            headers: external ? { "x-api-key-external": external } : {},
            body: JSON.stringify({
              session_id: sessionId,
              script: {
                type: "text",
                input: text,
                provider: {
                  type: "elevenlabs",
                  voice_id: voiceId,
                  voice_config: ELEVENLABS_VOICE_CONFIG,
                },
              },
              config: DID_TALK_CONFIG,
              audio_optimization: 2,
            }),
          },
          action,
        );
        return jsonFromDid(r, action);
      }

      case "stop": {
        const { streamId, sessionId } = payload as {
          streamId: string;
          sessionId: string;
        };
        const r = await didFetch(
          `/talks/streams/${streamId}`,
          {
            method: "DELETE",
            body: JSON.stringify({ session_id: sessionId }),
          },
          action,
        );
        return jsonFromDid(r, action);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    didLog("error", "route handler exception", { action, message });
    return NextResponse.json({ error: message, action }, { status: 500 });
  }
}
