# Perfume Discovery & DIY Builder App - Architecture Design

## Overview
A full-stack Next.js application with three core features: perfume discovery, DIY perfume builder, and ingredient intelligence. Uses Next.js App Router, Tailwind CSS, and a pluggable AI backend.

---

## 1. FOLDER STRUCTURE

```
perfume-app/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   │
│   ├── (features)/                # Feature routes group
│   │   ├── discover/
│   │   │   └── page.tsx           # Find Similar Perfumes page
│   │   ├── builder/
│   │   │   └── page.tsx           # DIY Perfume Builder page
│   │   └── ingredients/
│   │       └── page.tsx           # Ingredient Intelligence page
│   │
│   ├── api/
│   │   ├── perfumes/
│   │   │   ├── route.ts           # GET: search perfumes (mock data)
│   │   │   └── similar/
│   │   │       └── route.ts       # POST: find similar perfumes
│   │   ├── builder/
│   │   │   ├── generate-formula/
│   │   │   │   └── route.ts       # POST: generate formula from ingredients
│   │   │   ├── generate-from-vibe/
│   │   │   │   └── route.ts       # POST: generate from vibe description
│   │   │   └── inspired-by/
│   │   │       └── route.ts       # POST: create inspired-by formula
│   │   ├── ingredients/
│   │   │   ├── route.ts           # GET: search ingredients
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET: ingredient details + substitutes
│   │   └── ai/
│   │       └── chat.ts            # Central AI service (pluggable)
│   │
│   └── error.tsx                  # Error boundary
│
├── components/
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   │
│   ├── discover/
│   │   ├── PerfumeSearch.tsx      # Search input & controls
│   │   ├── PerfumeList.tsx        # Results display
│   │   ├── PerfumeCard.tsx        # Individual perfume card
│   │   └── SimilarityReason.tsx   # Why they're similar
│   │
│   ├── builder/
│   │   ├── BuilderTabs.tsx        # Tab switcher (3 modes)
│   │   ├── IngredientSelector.tsx # Select owned ingredients
│   │   ├── VibePicker.tsx         # Describe vibe
│   │   ├── PerfumeInspired.tsx    # Select inspiration perfume
│   │   ├── FormulaResult.tsx      # Display generated formula
│   │   └── FormulaPreview.tsx     # Formula breakdown
│   │
│   ├── ingredients/
│   │   ├── IngredientSearch.tsx   # Search bar
│   │   ├── IngredientCard.tsx     # Ingredient details
│   │   └── SubstituteList.tsx     # Substitutes display
│   │
│   └── common/
│       ├── Loading.tsx
│       ├── EmptyState.tsx
│       └── ErrorMessage.tsx
│
├── lib/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── claude.ts          # Claude API integration
│   │   │   ├── openai.ts          # OpenAI API integration (future)
│   │   │   └── index.ts           # Provider factory
│   │   └── prompts/
│   │       ├── similarity.ts      # Prompts for similarity matching
│   │       ├── formula.ts         # Prompts for formula generation
│   │       ├── vibe.ts            # Prompts for vibe-to-notes
│   │       └── ingredients.ts     # Prompts for ingredient info
│   │
│   ├── db/
│   │   ├── client.ts              # Supabase client (or mock)
│   │   ├── queries/
│   │   │   ├── perfumes.ts        # Perfume queries
│   │   │   ├── ingredients.ts     # Ingredient queries
│   │   │   └── substitutes.ts     # Substitute queries
│   │   └── types.ts               # Database types
│   │
│   ├── utils/
│   │   ├── validation.ts          # Input validation
│   │   ├── formatting.ts          # Format output
│   │   ├── constants.ts           # App constants
│   │   └── helpers.ts             # Utility functions
│   │
│   └── hooks/
│       ├── useAI.ts               # AI query hook
│       ├── usePerfumeSearch.ts    # Perfume search hook
│       ├── useBuilder.ts          # Builder state hook
│       └── useIngredients.ts      # Ingredient hook
│
├── types/
│   ├── index.ts                   # Central type exports
│   ├── perfume.ts                 # Perfume types
│   ├── ingredient.ts              # Ingredient types
│   ├── formula.ts                 # Formula types
│   └── ai.ts                      # AI response types
│
├── data/
│   ├── mock-perfumes.ts           # Mock perfume database
│   ├── mock-ingredients.ts        # Mock ingredient database
│   └── mock-substitutes.ts        # Mock substitutes data
│
├── public/
│   └── ...                        # Static assets
│
├── .env.local                     # Environment variables (NOT committed)
├── .env.example                   # Template for env vars
├── ARCHITECTURE.md                # This file
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── eslint.config.mjs
```

---

## 2. DATA MODELS

### Perfume
```typescript
interface Perfume {
  id: string;
  name: string;
  brand: string;
  releaseYear?: number;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  concentration?: 'cologne' | 'edt' | 'edp' | 'parfum';
  imageUrl?: string;
  description?: string;
}
```

### Ingredient
```typescript
interface Ingredient {
  id: string;
  name: string;
  commonNames?: string[];
  scentProfile: string;
  role: 'top' | 'middle' | 'base' | 'bridge';
  typicalUsageMin: number;    // percentage
  typicalUsageMax: number;
  odorThreshold?: string;
  volatility?: 'high' | 'medium' | 'low';
  notes?: string;
}
```

### Substitute
```typescript
interface Substitute {
  id: string;
  ingredient: string;
  substitutes: Array<{
    name: string;
    reason: string;
    compatibility: number; // 0-100 similarity score
  }>;
}
```

### Formula
```typescript
interface Formula {
  id?: string;
  name?: string;
  ingredients: Array<{
    name: string;
    percentage: number;
    role: string;
  }>;
  concentration?: string;
  estimatedScent?: string;
  inspirationSource?: string;  // 'vibe' | 'ingredients' | 'perfume'
  createdAt?: Date;
}
```

---

## 3. API ROUTES

### Discover Feature
- **`GET /api/perfumes`** - Search perfumes by name or notes
  - Query params: `q` (search), `note` (filter by note)
  - Returns: `Perfume[]`

- **`POST /api/perfumes/similar`** - Find similar perfumes
  - Body: `{ perfumeName?: string; notes?: string[] }`
  - Returns: `{ perfumes: Perfume[], reasons: string[] }`

### Builder Feature
- **`POST /api/builder/generate-formula`** - Generate formula from owned ingredients
  - Body: `{ ingredients: string[] }`
  - Returns: `Formula`

- **`POST /api/builder/generate-from-vibe`** - Generate from vibe description
  - Body: `{ vibe: string }`
  - Returns: `{ notes: string[], formula: Formula }`

- **`POST /api/builder/inspired-by`** - Create inspired-by formula
  - Body: `{ perfumeName: string }`
  - Returns: `Formula`

### Ingredients Feature
- **`GET /api/ingredients`** - Search ingredients
  - Query params: `q` (search), `role` (filter by role)
  - Returns: `Ingredient[]`

- **`GET /api/ingredients/[id]`** - Get ingredient details
  - Returns: `{ ingredient: Ingredient, substitutes: Substitute[] }`

---

## 4. DATA FLOW DIAGRAMS

### Feature 1: Find Similar Perfumes
```
User Input (Perfume Name or Notes)
    ↓
Frontend: PerfumeSearch component
    ↓
POST /api/perfumes/similar
    ↓
API Route Handler
    ├─ Fetch target perfume from DB
    ├─ Call AI (Claude) with prompt: "Find similar perfumes"
    └─ AI analyzes shared notes, profile, style
    ↓
Backend: AI Service
    ├─ Use AI to generate similarity explanations
    └─ Return: perfume matches + WHY connections
    ↓
Frontend: PerfumeList + SimilarityReason components
    ↓
Display results with shared notes & explanations
```

### Feature 2: DIY Perfume Builder (3 Modes)
```
┌─ Mode A: Own Ingredients ─────────────────┐
│ Select Ingredients (checkboxes)           │
│ POST /api/builder/generate-formula        │
│ AI: "Create formula with ONLY these"      │
│ Return: percentage breakdown              │
└───────────────────────────────────────────┘

┌─ Mode B: Vibe Description ────────────────┐
│ User: "rainy forest at night"             │
│ POST /api/builder/generate-from-vibe      │
│ AI: Translate vibe → scent notes          │
│ AI: Generate formula from those notes     │
│ Return: notes + formula percentages       │
└───────────────────────────────────────────┘

┌─ Mode C: Inspired By ─────────────────────┐
│ Select a perfume                          │
│ POST /api/builder/inspired-by             │
│ AI: Analyze target perfume's profile      │
│ AI: Create inspired formula (not clone)   │
│ Return: modified formula                  │
└───────────────────────────────────────────┘
```

### Feature 3: Ingredient Intelligence
```
User searches ingredient
    ↓
GET /api/ingredients?q=keyword
    ↓
Frontend: IngredientCard displays
    ├─ Scent profile
    ├─ Role (top/middle/base)
    ├─ Typical usage %
    └─ "Show Substitutes" button
    ↓
On click: GET /api/ingredients/[id]
    ↓
Display
    ├─ Ingredient details
    └─ Substitutes list with reasons & compatibility
```

---

## 5. AI INTEGRATION ARCHITECTURE

### Pluggable Provider Pattern
```typescript
// lib/ai/providers/index.ts
interface AIProvider {
  chat(message: string, systemPrompt?: string): Promise<string>;
  complete(prompt: string): Promise<string>;
}

// Usage
const provider: AIProvider = initializeProvider(process.env.AI_PROVIDER);
// Can be 'claude', 'openai', etc.
```

### Environment Configuration
```
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Future
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Prompt Templates
Each feature has structured prompts in `lib/ai/prompts/`:
- **Similarity matching**: Context about perfume profiles, ask for reasoning
- **Formula generation**: Ingredient percentages, concentration types
- **Vibe translation**: Emotional descriptions → scent families
- **Ingredient info**: Extract profile, role, usage, substitutes

---

## 6. STATE MANAGEMENT

### Client-side (React)
- **React `useState`** for simple component state (search inputs, results)
- **Custom hooks** for complex features:
  - `useBuilder()` - manages all 3 builder modes + formula state
  - `usePerfumeSearch()` - manages search history + results
  - `useAI()` - handles AI requests + loading/error states

### Server-side (Node.js)
- Next.js API routes handle all business logic
- Stateless design (each request is independent)

---

## 7. STYLING APPROACH

- **Tailwind CSS 4** for all styling
- **Color palette**:
  - Primary: Amber/Gold (perfume luxury theme)
  - Neutral: Slate/Stone
  - Semantic: Red (errors), Green (success)
- **Component library** in `components/ui/` for consistency
- **Responsive**: Mobile-first design

---

## 8. DATABASE STRATEGY

### Phase 1 (MVP): Mock Data
- `data/mock-perfumes.ts` - 50-100 popular perfumes
- `data/mock-ingredients.ts` - 100+ common perfume ingredients
- `data/mock-substitutes.ts` - Substitution mappings

### Phase 2: Supabase Integration
```sql
-- Tables
CREATE TABLE perfumes (
  id UUID PRIMARY KEY,
  name VARCHAR,
  brand VARCHAR,
  top_notes JSONB,
  middle_notes JSONB,
  base_notes JSONB,
  created_at TIMESTAMP
);

CREATE TABLE ingredients (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,
  scent_profile TEXT,
  role VARCHAR,
  typical_usage_min FLOAT,
  typical_usage_max FLOAT,
  created_at TIMESTAMP
);

CREATE TABLE substitutes (
  id UUID PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients,
  substitute_id UUID REFERENCES ingredients,
  reason TEXT,
  compatibility FLOAT
);
```

---

## 9. ERROR HANDLING

- **Frontend**: Error boundaries + user-friendly messages
- **API Routes**: Standardized error responses
  ```typescript
  {
    success: false,
    error: "User-friendly message",
    code: "ERROR_CODE"
  }
  ```
- **AI Failures**: Graceful fallback (show template or retry)
- **Rate Limiting**: Implement for AI API calls to control costs

---

## 10. PERFORMANCE CONSIDERATIONS

- **API Response Caching**: Use Next.js `unstable_cache` for perfume/ingredient queries
- **Lazy Loading**: Load components when needed (builder tabs)
- **Image Optimization**: Next.js `Image` component with perfume photos
- **Build Optimization**: Tree-shake unused code, minify CSS

---

## 11. DEPLOYMENT

- **Hosting**: Vercel (native Next.js support)
- **Database**: Supabase (PostgreSQL cloud)
- **Environment Variables**: Managed via Vercel dashboard
- **CI/CD**: GitHub Actions for build/test pipeline

---

## 12. SECURITY CONSIDERATIONS

- **API Key Protection**: Store AI keys server-side only
- **Input Validation**: Sanitize all user inputs (use Zod)
- **CORS**: Configure for production domain
- **Rate Limiting**: Prevent abuse of AI endpoints
- **HTTPS Only**: Enforced by Vercel + Supabase

---

## 13. NEXT STEPS

1. ✅ Architecture design (THIS DOCUMENT)
2. Set up project structure & components
3. Create API routes with mock data
4. Build UI for all three features
5. Integrate Claude AI API
6. Add Supabase integration
7. Testing & refinement
8. Deploy to Vercel
