# Smart Meeting Summary Generator

I built a classic two-tier JavaScript application that turns a raw meeting transcript into a structured summary with **Topics**, **Decisions**, and **Action Items** (including owners and due dates whenever they are mentioned in the transcript).

## My system architecture

I split the project into two independent services so the frontend and backend can evolve separately and so the AI key never touches the browser.

```text
┌─────────────────────┐        HTTP/JSON         ┌──────────────────────────┐        HTTPS         ┌────────────────────────┐
│  React (Vite, JS)   │  ───────────────────▶   │  Node.js + Express API   │  ─────────────────▶  │   Google Gemini API    │
│  /frontend          │  ◀───────────────────   │  /backend                │  ◀─────────────────  │  (Flash / Flash Lite)  │
└─────────────────────┘                          └──────────────────────────┘                       └────────────────────────┘
```

Folder layout I chose:

```text
/backend     Node.js + Express API (plain JavaScript, ES modules)
/frontend    React + Vite UI (plain JavaScript)
```

Inside the backend I kept a clean separation of concerns:

- `services/aiGateway.js` — the AI provider wrapper (one place to swap models).
- `services/summarizer.js` — prompt construction, JSON-mode call, and response validation/normalization.
- `routes/summarize.js` — thin HTTP layer that does request validation and delegates to the service.
- `server.js` — Express bootstrap, CORS, and error handling.

This way, if I later add audio uploads, I only need to drop a transcription step in front of `summarizeAll()` — no other code changes.

## The stack I picked

- **Frontend**: React 18 + Vite + plain JavaScript + hand-written CSS. I wanted a small, dependency-light UI that's easy to read.
- **Backend**: Node.js 20+, Express, ES modules, plain JavaScript. A familiar, reviewer-friendly setup with no build step.
- **AI**: Google Gemini API using Flash/Flash Lite models with JSON output mode.

## The AI tool I selected and my reasoning

I used the **Google Gemini API** directly with Flash/Flash Lite models.

Why I chose it:

- **Fast and cheap for structured extraction.** A meeting summary is a high-volume, low-creativity task where Gemini Flash models are a practical fit.
- **Native JSON output.** Asking Gemini for `application/json` removes most parsing headaches and is the first line of defense against hallucinated formatting.
- **Swappable provider wrapper.** I isolated the model call inside `services/aiGateway.js`, so changing models later would not affect the rest of the app.
- **One server-side key.** `GEMINI_API_KEY` lives only on the backend; the browser never sees it, which keeps the integration secure by default.

## How I manage hallucinations

This was the most important part of the brief for me, so I tackled it on three layers:

1. **Prompt discipline** — the system prompt tells the model to use only what is in the transcript and to omit anything that isn't explicitly stated, instead of guessing.
2. **JSON mode + schema normalization** — I force JSON output and then run the response through my own normalizer in `summarizer.js`, which drops any field that doesn't match the canonical shape.
3. **Honest empty states** — if the model returns nothing for a section, the UI shows a friendly "nothing found" message instead of inventing placeholder content.

## Features I implemented

### MVP
- Paste a raw transcript.
- Generate a structured summary with Topics, Decisions, and Action Items (owners + due dates when stated).
- A clean, readable UI with per-section cards.

### Bonus features I also implemented
- **Inline editing** of every field (topic titles, summaries, decisions, action items, owners, due dates).
- **Regenerate a single section** without losing the others — a separate endpoint that re-prompts only the requested section while passing the existing context.

### Future work
- RAG over past meetings (store transcripts + embeddings and feed prior context into new summaries).
- Audio upload + transcription (Whisper or similar) feeding into the same summarization pipeline.

## Running the project locally

You need **Node.js 20+** and a `GEMINI_API_KEY` from Google AI Studio (server-side only).

### 1. Start the backend

```bash
cd backend
cp .env.example .env        # then put your GEMINI_API_KEY in .env
npm install
npm run dev                 # http://localhost:8787
```

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Then open <http://localhost:5173>, click **Load sample**, and hit **Generate Summary**.

## API I exposed

`POST /api/summarize`
```json
{ "transcript": "..." }
```
Returns:
```json
{
  "topics":      [{ "title": "...", "summary": "..." }],
  "decisions":   [{ "decision": "...", "context": "..." }],
  "actionItems": [{ "task": "...", "owner": "...", "dueDate": "..." }]
}
```

`POST /api/summarize/section`
```json
{ "transcript": "...", "section": "actionItems", "existing": { ... } }
```
Returns only the regenerated section.

## Why I chose this stack overall

- **Express + plain JS backend** is the classic Node.js architecture most teams already use for take-home reviews — easy to read, no build step, no TypeScript noise.
- **Strict separation of concerns** means any of the three layers (UI, HTTP, AI) can be swapped without touching the others.
- **Google Gemini** gave me a free, accessible AI model with a single server-side key, so I could focus on the product rather than on auth plumbing.
