import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { getFigure } from "@/lib/figures";
import { createClient } from "@/lib/supabase/server";

const EL_API = "https://api.elevenlabs.io/v1";
const CACHE_FILE = path.join(
  process.env.ELEVENLABS_AGENT_CACHE_DIR ??
    (process.env.VERCEL ? os.tmpdir() : process.cwd()),
  ".eleven-agents.json",
);
/** Bump when agent prompt / turn-taking config changes. */
const AGENT_CACHE_VERSION = "v8-gender-voices";

/** Client tool the figure calls to render a visual on the on-screen whiteboard. */
const SHOW_ON_BOARD_TOOL = {
  type: "client",
  name: "show_on_board",
  description:
    "Display a visual on the teaching whiteboard beside you so the student can SEE what you are explaining. Call this whenever a picture, diagram, formula, equation, map, timeline, labeled drawing, or sketch of an object would help the explanation. Keep speaking naturally; the board updates on its own.",
  expects_response: false,
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description:
          "Short heading shown at the top of the board, e.g. 'Mass-energy equivalence' or 'Charleville 1777 musket'.",
      },
      note: {
        type: "string",
        description:
          "Optional formula or short text as LaTeX for instant rendering on the board, e.g. 'E = mc^2', 'F = ma', or '\\frac{GMm}{r^2}'. Use this for ALL math and equations. Omit if only an illustration is needed.",
      },
      image_prompt: {
        type: "string",
        description:
          "Optional concrete visual description of a picture or diagram to DRAW on the board (a labeled illustration, map, structure, object, or scene). Omit for a text-only note.",
      },
    },
    required: ["title"],
  },
} as const;
const DEFAULT_LLM_MODEL = "gemini-2.0-flash";

function apiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("Missing ELEVENLABS_API_KEY");
  return key;
}

type AgentCache = { version?: string; agents: Record<string, string> };

async function readCache(): Promise<Record<string, string>> {
  try {
    const raw = JSON.parse(
      await fs.readFile(CACHE_FILE, "utf8"),
    ) as Partial<AgentCache>;
    if (raw.version === AGENT_CACHE_VERSION && raw.agents) {
      return raw.agents;
    }
    return {};
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, string>) {
  const payload: AgentCache = {
    version: AGENT_CACHE_VERSION,
    agents: cache,
  };
  await fs.writeFile(CACHE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

async function createAgentForFigure(figureId: string): Promise<string> {
  const figure = getFigure(figureId);
  if (!figure) throw new Error(`Unknown figure: ${figureId}`);
  const model = process.env.ELEVENLABS_LLM_MODEL ?? DEFAULT_LLM_MODEL;
  const knowledgeBrief = figure.knowledgeBrief
    ? `
## Grounding context
Use this compact context as your first source before relying on general knowledge:
${figure.knowledgeBrief}
`
    : "";

  const res = await fetch(`${EL_API}/convai/agents/create`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `Office Hours — ${figure.fullName}`,
      conversation_config: {
        agent: {
          first_message: figure.greeting,
          language: "en",
          prompt: {
            prompt: `${figure.persona}${knowledgeBrief}
## Question discipline
- Treat the latest student utterance as the task. Answer it directly before adding background.
- If the student asks how, why, when, or what, address that exact question first.
- If the topic is outside your specialty, answer briefly if you can, then bridge back to your tutoring subject.

## Turn-taking (critical)
- Treat this as a spoken conversation with clear turns: ask one question, then STOP and wait for the student.
- Never send two replies in a row. Do not fill silence with extra monologues.
- Keep each reply short (2–4 sentences) so the student can interrupt.`,
            llm: model,
            temperature: 0.7,
            tools: [SHOW_ON_BOARD_TOOL],
          },
        },
        tts: { voice_id: figure.voiceId },
        conversation: {
          turn_timeout: 60,
        },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Agent create failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  return data.agent_id as string;
}

async function ensureAgent(figureId: string): Promise<string> {
  const cache = await readCache();
  if (cache[figureId]) return cache[figureId];
  const agentId = await createAgentForFigure(figureId);
  cache[figureId] = agentId;
  await writeCache(cache);
  return agentId;
}

async function getConversationToken(agentId: string): Promise<string> {
  const res = await fetch(
    `${EL_API}/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey() } },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Token fetch failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  return data.token as string;
}

export async function POST(req: NextRequest) {
  try {
    const { figureId } = (await req.json()) as { figureId: string };

    // 1) Require a signed-in user — no anonymous access to paid APIs.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to start a session.", code: "unauthenticated" },
        { status: 401 },
      );
    }

    // 2) Atomically consume one free conversation credit. The RPC is scoped to
    //    auth.uid() server-side, so a user can only spend their own credits.
    const { data, error } = await supabase.rpc("consume_conversation_credit");
    if (error) {
      return NextResponse.json(
        { error: "Could not verify your conversation credits." },
        { status: 500 },
      );
    }
    const result = (data as { allowed: boolean; remaining: number }[] | null)?.[0];
    if (!result?.allowed) {
      return NextResponse.json(
        {
          error: "You've used all your free conversations.",
          code: "no_credits",
        },
        { status: 402 },
      );
    }

    // 3) Credit spent — provision the agent + conversation token.
    const agentId = await ensureAgent(figureId);
    const conversationToken = await getConversationToken(agentId);
    return NextResponse.json({
      agentId,
      conversationToken,
      remaining: result.remaining,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
