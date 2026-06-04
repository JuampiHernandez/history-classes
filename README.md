# The Academy — voice-first exam prep with legendary tutors

Tomorrow's exam. Legendary minds. Live voice tutoring with D-ID lip-sync avatars, ElevenLabs ConvAI agents, and an on-session whiteboard (KaTeX formulas + Gemini illustrations).

The brand system (logo, palette, typography, UI components) lives at the `/brand` route.

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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (auth + credits) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase **publishable** key (`sb_publishable_…`) |

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

## Auth & free-conversation credits

Paid APIs (ElevenLabs, D-ID, whiteboard image generation) are gated behind
**Google sign-in via Supabase**. Every account gets **2 free live conversations**;
after that the session UI is blocked until paid credits are added.

**How it works**

- `proxy.ts` (Next.js 16's renamed Middleware) refreshes the Supabase session on
  each request.
- `/api/elevenlabs` requires a signed-in user and **atomically consumes one
  credit** (Postgres `consume_conversation_credit()` RPC, scoped to `auth.uid()`)
  before issuing a conversation token. `/api/did` (`create`) and `/api/whiteboard`
  also require a signed-in user with credits remaining.
- The `/session/[figureId]` page redirects anonymous users to `/login` and shows
  an "out of credits" screen at 0 remaining.
- Credits live in `public.user_usage` with **RLS** (users can only read their own
  row; all writes go through `SECURITY DEFINER` functions). A trigger in a private
  schema auto-creates the row on signup.

The database schema is already applied to the Supabase project (migrations
`user_usage_credits`, `lock_down_function_execute_grants`,
`move_trigger_fn_to_private_schema`). To adjust the free limit, change the
`free_conversations_limit` default on `public.user_usage`.

### Supabase setup (one-time, dashboard only)

These steps **cannot be automated via API** and must be done in the consoles:

1. **Google Cloud Console** → APIs & Services → Credentials → create an **OAuth
   2.0 Client ID** (Web application). Authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. **Supabase dashboard** → Authentication → Providers → **Google** → paste the
   Client ID + Client Secret and enable it.
3. **Supabase dashboard** → Authentication → URL Configuration:
   - **Site URL**: `http://localhost:3000` (and your production URL).
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and
     `https://<your-domain>/auth/callback`.

After that, "Continue with Google" on `/login` works end to end.

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
