# Office Hours — historical AI tutors

Live voice tutoring with D-ID lip-sync avatars, ElevenLabs ConvAI agents, and an on-session whiteboard (KaTeX formulas + Gemini illustrations).

## Setup (manual steps)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `ELEVENLABS_API_KEY` | Yes | Create agents + WebRTC conversation tokens |
| `D_ID_API_KEY` | Yes | Lip-sync avatar streams |
| `OPENAI_API_KEY` | **Dev** | Whiteboard illustrations locally (`gpt-image-1`) |
| `AI_GATEWAY_API_KEY` or Vercel OIDC | **Vercel** | Whiteboard via **AI Gateway**: `google/imagen-4.0-generate-001`, then `google/gemini-3.1-flash-image-preview` |
| `GEMINI_API_KEY` | Optional | Direct Gemini in dev if you skip OpenAI |
| `ELEVENLABS_LLM_MODEL` | No | Default `gemini-2.0-flash` |

**Formulas** always use KaTeX (no API). **Diagrams** route by environment:

- **Local `npm run dev`** → OpenAI (if `OPENAI_API_KEY` is set), else Pollinations
- **Any Vercel deploy** (preview or production) → AI Gateway (Imagen → Gemini), else Pollinations

Use gateway locally with `vercel link` + `vercel env pull` (OIDC) or `AI_GATEWAY_API_KEY`. By default, **local dev uses OpenAI** so you do not spend gateway credits unless you opt in.

### 3. Regenerate ElevenLabs agents (after prompt/tool changes)

Agent IDs are cached in `.eleven-agents.json`. When the cache version bumps (e.g. after pulling new code), either:

- **Delete** `.eleven-agents.json` and restart the dev server, or  
- Start a session for a figure you have not used yet (new agents are created on first request).

Each figure’s agent is recreated automatically on first session start after the cache is cleared.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), pick a tutor, allow the microphone, and start a session.

### 5. Deploy (Vercel)

In the Vercel project:

1. Enable **AI Gateway** in project settings (uses your gateway balance).
2. Set `ELEVENLABS_API_KEY` and `D_ID_API_KEY` (same as local).
3. You do **not** need `OPENAI_API_KEY` on Vercel — illustrations use Gateway (Imagen, then Gemini) via OIDC.

## Whiteboard behavior

- **Math / formulas** → `note` field → **KaTeX** (instant).
- **Illustrations** → `image_prompt` → **POST `/api/whiteboard`** → OpenAI (dev) or Gateway Imagen/Gemini (Vercel), or Pollinations on failure.

Tutors call the `show_on_board` client tool during conversation; the panel appears beside the avatar on desktop.

## Scripts

```bash
npm run dev    # development
npm run build  # production build
npm run lint   # ESLint
```
