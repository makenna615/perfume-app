# Memories Into Perfumes (MIP)

AI-powered perfume app for discovery, formula generation, ingredient intelligence, and Fragrantica-style perfume lookup.

## Features

- Discover similar perfumes by:
  - perfume name
  - scent notes
- Perfume Details mode:
  - Fragrantica-first lookup
  - note pyramid (top/middle/base)
  - accords, release year, community rating/review count when available
  - ambiguity handling for same-name perfumes across brands
- DIY Perfume Builder:
  - `By Vibe`
  - `By Ingredients`
  - `By Inspiration`
  - optimization modes: balanced, longevity, projection
  - formula visualization + scaling support
- Ingredient Intelligence:
  - ingredient search
  - role/volatility/usage
  - supplier and substitute support
- App-level password protection for pages + API routes (session cookie auth)

## Tech Stack

- Framework: Next.js `16` (App Router)
- Language: TypeScript
- UI: React `19`, Tailwind CSS `4`
- Motion/Icons/Charts:
  - Framer Motion
  - Heroicons
  - Recharts
- AI: OpenAI Node SDK (`openai`)
- Auth Gate: `proxy.ts` + signed cookie session (`lib/auth/session.ts`)

## Project Structure

```txt
app/
  (features)/
    builder/page.tsx
    discover/page.tsx
    ingredients/page.tsx
  api/
    auth/login/route.ts
    auth/logout/route.ts
    builder/generate/route.ts
    ingredients/search/route.ts
    perfumes/search/route.ts
    perfume-intelligence/route.ts
    generateFormula/route.ts
  login/page.tsx
  layout.tsx
  page.tsx

components/
  features/
  layout/
  ui/

lib/
  ai/
    prompts.ts
    openai-service.ts
    factory.ts
  auth/session.ts
  hooks/
```

## Environment

```bash
OPENAI_API_KEY=...            # required (falls back to mock data without it)
OPENAI_MODEL=gpt-5.4-mini     # optional; default. gpt-5.5 is the most accurate but ~2-3x slower
OPENAI_REASONING_EFFORT=low   # optional; for gpt-5.x models (low | medium | high)
AI_PROVIDER=openai            # or "mock" for offline development
APP_PASSWORD=...
SESSION_SECRET=...
```

All prompts live in `lib/ai/prompts.ts`. They share a perfumery reference block (notes vs. materials, usage levels, IFRA flags) and strict accuracy rules: the model returns null rather than guessing, and is never asked for prices, stock, ratings or URLs.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build & Lint

```bash
npm run lint
npm run build
```
