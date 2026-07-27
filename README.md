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
