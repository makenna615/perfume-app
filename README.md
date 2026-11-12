# Memories Into Perfumes

**An AI-powered fragrance studio: find perfumes that truly smell alike, look up accurate note pyramids, and turn a memory into a perfume formula you can actually mix.**

**Live app:** https://perfume-app-ruby.vercel.app (password-protected — access by invitation)

![Home page](docs/screenshots/home.jpg)

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4 and the OpenAI API.

---

## Why I built this

I collect perfume as a hobby — my collection is over 100 bottles — and I recently started making my own. That's when I hit a wall: good information on how to actually make perfume is surprisingly hard to find. Researching a formula meant piecing together forum threads, supplier pages and note lists, and working out which raw materials create which notes, how much of each to use, and which ones are restricted.

I wanted one place to do all of that, so I combined my two interests — coding and perfumery — and built it. Memories Into Perfumes is the tool I wished I'd had when I started: a way to explore the perfumes I love, understand what's in them, and turn an idea into a formula I can mix with the materials I have.

Building it brought its own challenge. General-purpose AI is confidently wrong about perfume: it invents shared notes between fragrances, treats marketing terms like "white musk" or "sea breeze" as ingredients you can buy, and suggests dosages that would ruin a formula. Much of the engineering here is about making AI **trustworthy in a specialist domain** — through prompt design, output validation, real data sources and an honest UI.

## What it does

| | |
|---|---|
| **Discover** | Find alternatives to a perfume — labelled as a near-identical dupe, close alternative, flanker or same family, with the notes they really share and how they differ. Look up any perfume's note pyramid, accords, performance and best seasons. Search for perfumes built around specific notes. |
| **Compose** | Describe a memory ("a rainy pine forest at dusk"), list the materials on your shelf, or name a perfume to reinterpret. Get a weighable formula of real, purchasable materials at realistic levels, with safety notes and a batch calculator for any strength and bottle size. Save formulas to a notebook. |
| **Materials** | Learn what's behind a note — e.g. "white musk" → Galaxolide, Habanolide, Ethylene Brassylate — with odor profile, typical usage, dilution, allergens and IFRA restrictions. |

![Perfume details](docs/screenshots/perfume-details.jpg)

![Generated formula with batch calculator](docs/screenshots/formula.jpg)

---

## Engineering highlights

### Prompt engineering for factual accuracy
- **Shared domain knowledge in every prompt** — a reference block distinguishing marketing *notes* from purchasable *materials*, realistic usage levels per material, evaporation timings, product concentrations and IFRA/safety rules (phototoxic citrus, restricted mosses, EU-banned Lilial/Lyral).
- **Explicit permission not to know** — the model returns `null`, an empty list or a lower confidence instead of guessing, and low-confidence results are never shown as facts.
- **Never asking for unknowable data** — the model isn't asked for prices, stock, ratings or URLs; the app builds store links itself and shows cost as a coarse tier.
- **Built-in verification** — similar-perfume results only list notes present in *both* published pyramids, and weak matches are dropped rather than padded.

### Model evaluation, not guesswork
I ran the same prompts against four models and checked the answers against published note lists. The original GPT-4-class models suggested perfumes that aren't real alternatives and invented shared notes; `gpt-5.5` was the most accurate but took ~27 s per request; **`gpt-5.4-mini` matched it closely at 4–18 s** and became the default. The model is configurable through an environment variable, and the service supports both standard and reasoning-model APIs.

### Treating LLM output as untrusted input
- One AI service layer with JSON mode, automatic retry and truncation detection.
- Every response passes through typed sanitizers (`lib/ai/sanitize.ts`) — enums checked, strings length-capped, years range-checked, duplicates removed.
- Formulas are normalised to exactly 100% and sorted by note layer.
- User input is length-limited and embedded as data, not instructions.

### Combining real data with AI
Perfume lookups query **Fragrantica first** (in parallel) for the published note pyramid, accords and community rating, and run the AI lookup concurrently for descriptive fields — then merge them, with Fragrantica winning on facts. The UI shows where the notes came from, so users know when to double-check.

### Security
- Every page and API route is behind a password login with signed session cookies and login rate limiting.
- Audited dependencies and upgraded Next.js to close known login-bypass vulnerabilities, then tested the fix by trying to break in (forged cookies, URL tricks).

### Design & accessibility
A custom design system with one colour per note layer (top, heart, base) used across every view — keyboard-friendly, screen-reader labelled and responsive down to phone width.

![Materials library on mobile](docs/screenshots/materials-mobile.jpg)

---

## Tech stack

- **Framework:** Next.js 16.4 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4 (`@theme` design tokens), `next/font`
- **AI:** OpenAI Node SDK, JSON mode; swappable provider with an offline mock
- **Auth:** custom proxy gate + signed cookie sessions (Web Crypto HMAC-SHA256)
- **Hosting:** Vercel

## Architecture

```txt
Browser ──► proxy.ts (login gate) ──► Route handlers (app/api/*)
                                         │
                                         ├─► lib/ai/prompts.ts      prompt + shared perfumery reference
                                         ├─► lib/ai/openai-service  JSON mode, retries, model config
                                         ├─► lib/ai/sanitize.ts     validate untrusted model output
                                         └─► Fragrantica            real note pyramids (perfume lookup)
```

