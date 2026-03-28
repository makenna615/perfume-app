// prompts.ts - Upgraded for Advanced AI Perfume Lab

export type OptimizationMode = "balanced" | "longevity" | "projection";

// Helper: Standard instructions for JSON enforcement and safe ingredients
function wrapJSONPrompt(prompt: string, schemaDescription: string): string {
  return `
You are a master perfumer with 25+ years of commercial fragrance experience.

CRITICAL OUTPUT RULES:
1. Return ONLY valid JSON - NO text, markdown, code blocks, or explanations outside JSON
2. Extract JSON object even if wrapped in markdown - output must be pure JSON
3. Validate: All percentages sum to exactly 100 (use whole numbers only)
4. Use ONLY real, commercially-available fragrance ingredients (e.g., bergamot, ylang-ylang, sandalwood, white musk)
5. Each ingredient must have assigned role: "top", "middle", or "base" (never other values)
6. Ensure reasonable ingredient count: 4-8 ingredients for balanced formulas
7. Must include at least 1 ingredient per role (top/middle/base) unless explicitly otherwise

PERCENTAGE DISTRIBUTION RULES:
- BALANCED mode: top 15-25%, middle 40-50%, base 25-35%
- LONGEVITY mode: top 5-15%, middle 30-40%, base 45-55% (base-forward for lasting power)
- PROJECTION mode: top 25-35%, middle 35-45%, base 20-30% (volatile top for throw)

INGREDIENT QUALITY:
- Prefer well-known commercial suppliers: Dragoco, Grasse International, Firmenich, IFF, Symrise
- Include realistic supplier names in responses
- Price guidance: Top notes $30-80/100ml, Middle notes $40-120/100ml, Base notes $50-150/100ml
- Availability should reflect commercial stock reality

SENSORY DESCRIPTIONS:
Format as: [Opening] → [Heart Development] → [Dry Down]
Example: "Fresh bergamot sparkles with green tea and pepper → blooms into rose and jasmine heart → settles on creamy sandalwood and amber"

JSON Schema:
${schemaDescription}

${prompt}
`;
}

// Optimization guide helper
function getOptimizationGuide(mode: OptimizationMode): string {
  const guides: Record<OptimizationMode, string> = {
    longevity:
      "LONGEVITY MODE: Create base-forward structure (45-55% base oils/fixatives). Use fixative molecules (Iso E Super, Hedione, Galaxolide). Minimize volatile top notes (5-15%). Heart notes 30-40%. Target: 8+ hour longevity. Example: Iris → Velvet Rose → Sandalwood-Amber base",
    projection:
      "PROJECTION MODE: Maximize volatile throw with strong top & heart (60%+ combined). Use high-volatility ingredients (citrus, aldehydes, spicy notes). Keep base moderate (20-30%). Use aroma chemicals for impact. Target: Strong immediate presence, 2-3 hour apparent lifetime. Example: Neroli Bergamot → Spicy Pepper → Musk base",
    balanced:
      "BALANCED MODE: Smooth progression through three tiers (top 15-25%, heart 40-50%, base 25-35%). Natural evolution from lively opening to solid base. Use classical composition rules. Target: Professional, wearable fragrance with clear phases.",
  };
  return guides[mode];
}

// Similar perfumes prompt
export function getSimilarPerfumesPrompt(perfumeName: string): string {
  const prompt = `
A customer loves "${perfumeName}" and wants similar perfumes.
You are an expert fragrance sommelier with deep knowledge of commercial fragrances.

Find the 5 MOST similar perfumes by:
1. Matching scent profile (top, heart, base notes overlap)
2. Similar fragrance family (fruity-floral, woody-aromatic, fresh-citrus, oriental, gourmand, etc.)
3. Similar character, mood, and wearing scenario
4. Realistic alternatives at different price points

Ensure matchPercentage reflects true similarity (0-100%, 100%=identical).
Real examples: Narciso Rodriguez For Her → Glossier You, Viktor & Rolf Bonbon, etc.
`;

  const schema = `
{
  "basePerf": "string (the input perfume)",
  "fragranceFamily": "string (e.g., Creamy Floral, Fresh Citrus, Woody Oriental)",
  "keyCharacteristics": ["string"],
  "similarPerfumes": [
    {
      "name": "string",
      "brand": "string",
      "matchPercentage": "number (0-100, realistic similarity)",
      "fragranceFamily": "string",
      "sharedNotes": ["string (2-4 notes)"],
      "explanation": "string (1-2 sentences why it's similar)"
    }
  ]
}

Example output:
{
  "basePerf": "Chanel No. 5",
  "fragranceFamily": "Classic Floral",
  "keyCharacteristics": ["Aldehydic", "Rosy", "Powdery", "Elegant"],
  "similarPerfumes": [
    {
      "name": "Estée Lauder Youth Dew",
      "brand": "Estée Lauder",
      "matchPercentage": 75,
      "fragranceFamily": "Aldehydic Floral",
      "sharedNotes": ["aldehydes", "rose", "jasmine", "sandalwood"],
      "explanation": "Similar aldehydic opening and powdery rose heart, though warmer and more oriental than No. 5"
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Formula from vibe
export function getFormulaFromVibePrompt(
  vibe: string,
  optimizationMode: OptimizationMode = "balanced",
  targetVolumeMl: number = 50
): string {
  const guide = getOptimizationGuide(optimizationMode);
  const prompt = `
Create a unique ${targetVolumeMl}ml perfume formula inspired by: "${vibe}"
Mode: ${guide}

REQUIREMENTS:
1. Choose 5-6 real commercial ingredients (canonical names only: bergamot, ylang-ylang, sandalwood, white musk, etc.)
2. Assign each ingredient precise role: "top", "middle", or "base"
3. Percentages must sum to exactly 100 (whole numbers only)
4. Include clear reasoning for why each ingredient evokes the vibe
5. Use realistic supplier names and prices (see price guidance in system prompt)
6. Availability: vary between "in-stock", "limited", "backordered" realistically
7. Create 1-2 substitutes for each ingredient (for allergen/cost alternatives)
8. Sensory description: [Opening] → [Heart] → [Dry Down] format

Example vibe: "cozy autumn library"
Could yield: Tobacco leaf (top) → Leather & Vanilla (heart) → Sandalwood & Cedar (base)
`;

  const schema = `
{
  "formulaName": "string (creative but realistic name)",
  "vibe": "string (the input inspiration)",
  "optimizationMode": "string (balanced|longevity|projection)",
  "volumeMl": "number (50)",
  "ingredients": [
    {
      "name": "string (exact commercial ingredient name)",
      "percentage": "number (whole number, contributes to 100% total)",
      "role": "string (top|middle|base, must match optimization percentages)",
      "reason": "string (1-2 sentences explaining connection to vibe)",
      "supplier": {
        "name": "string (real supplier like Dragoco, Grasse International)",
        "price": "number (USD per 100ml, realistic for role)",
        "availability": "string (in-stock|limited|backordered)",
        "link": "string (optional supplier link)"
      },
      "substitutes": ["string (2-3 alternatives with similar scent profile)"]
    }
  ],
  "totalPercentage": "number (must be 100)",
  "description": "string (vivid sensory journey: opening → heart → dry down)",
  "timeline": {
    "top": "number (minutes, typically 5-15)",
    "heart": "number (minutes, typically 30-60)",
    "base": "number (hours, typically 2-8)"
  },
  "estimatedCostUsd": "number (ingredient cost for 50ml formula)"
}

Example:
{
  "formulaName": "Autumn Library",
  "vibe": "cozy autumn library",
  "ingredients": [
    {
      "name": "bergamot",
      "percentage": 15,
      "role": "top",
      "reason": "Bright, uplifting opening that fades like afternoon light through library windows",
      "supplier": {"name": "Dragoco", "price": 48, "availability": "in-stock"},
      "substitutes": ["lemon", "grapefruit"]
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Formula from ingredients
export function getFormulaFromIngredientsPrompt(
  ingredients: string[],
  optimizationMode: OptimizationMode = "balanced",
  targetVolumeMl: number = 50
): string {
  const guide = getOptimizationGuide(optimizationMode);
  const ingredientList = ingredients.map((i) => `- ${i}`).join("\n");
  
  const prompt = `
Create a ${targetVolumeMl}ml perfume formula using EXACTLY these ingredients:
${ingredientList}

Mode: ${guide}

REQUIREMENTS:
1. Use only the provided ingredients (no substitutions with unlisted ingredients)
2. If provided ingredients don't cover all roles (top/middle/base), use what's available but note the limitation
3. Suggest which provided ingredient role would be best if their class is ambiguous
4. Percentages sum to exactly 100 (whole numbers)
5. Explain how provided ingredients work together harmoniously
6. Provide realistic supplier data for each
7. Timeline and sensory description following fragrance evolution

Tips:
- Map provided ingredients to standard fragrance names (e.g., "rose oil" → "rose absolute")
- Explain interaction: does vanilla amplify fruity notes? Does sandalwood ground citrus?
- Include practical tips for using the formula (shelf life, dilution ratios, blending order)
`;

  const schema = `
{
  "formulaName": "string (creative name reflecting ingredients)",
  "ingredients": [
    {
      "name": "string (canonical fragrance name matching user input)",
      "percentage": "number",
      "role": "string (top|middle|base)",
      "reason": "string (how this ingredient contributes to overall formula)"
    }
  ],
  "totalPercentage": "number (must be 100)",
  "volumeMl": "number (${targetVolumeMl})",
  "description": "string (sensory profile: opening → heart → dry down)",
  "timeline": {
    "top": "number (minutes)",
    "heart": "number (minutes)",
    "base": "number (hours)"
  },
  "estimatedCostUsd": "number",
  "tips": "string (blending advice, shelf life, application suggestions)",
  "harmonyAnalysis": "string (how ingredients work together)"
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Inspired-by formula
export function getInspiredByFormulaPrompt(
  perfumeName: string,
  optimizationMode: OptimizationMode = "balanced",
  targetVolumeMl: number = 50
): string {
  const guide = getOptimizationGuide(optimizationMode);
  const prompt = `
Create a NEW ORIGINAL ${targetVolumeMl}ml fragrance inspired by "${perfumeName}" but distinctly different.
Mode: ${guide}

DO NOT clone—create an interpretation that captures the SPIRIT without copying notes:
- Same mood/feeling but different ingredients
- Similar family (e.g., both creamy florals) but unique composition
- If longevity mode: enhance lasting power vs original
- If projection mode: boost initial impact vs original
- If balanced mode: improve natural progression vs original

REQUIREMENTS:
1. Research "${perfumeName}" scent profile
2. Use real commercial ingredients (not exact copies)
3. Percentages sum to 100 (whole numbers)
4. Assign top/middle/base roles correctly
5. Realistic suppliers and pricing
6. Substitutes for each ingredient
7. Clear explanation of how interpretation differs from original
8. Vivid sensory description
`;

  const schema = `
{
  "formulaName": "string (inspired name, not echo of original)",
  "inspiration": "string (${perfumeName} - but differentiated)",
  "ingredients": [
    {
      "name": "string",
      "percentage": "number",
      "role": "string (top|middle|base)",
      "reason": "string"
    }
  ],
  "totalPercentage": "number (100)",
  "volumeMl": "number (${targetVolumeMl})",
  "description": "string (opening → heart → dry down)",
  "timeline": {
    "top": "number (minutes)",
    "heart": "number (minutes)",
    "base": "number (hours)"
  },
  "estimatedCostUsd": "number",
  "explanation": "string (how this interpretation differs and improves upon the original)",
  "keyDifferences": ["string (2-3 key differentiators)"]
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Notes similarity
export function getNotesSimilarityPrompt(notes: string[]): string {
  const notesList = notes.map((n) => `- ${n}`).join("\n");
  const prompt = `
Find commercial perfumes that contain these scent note combinations:
${notesList}

RESEARCH APPROACH:
1. Identify fragrance families these notes suggest (fruity, floral, woody, oriental, fresh, etc.)
2. Find real commercial perfumes known for these note combinations
3. Rank by how closely they match the provided notes profile
4. Include consideration: Do these notes appear together or separately in the perfume?

Include realistic matchPercentage (0-100), shared notes, and clear explanation.
`;

  const schema = `
{
  "inputNotes": ["string (the provided notes)"],
  "fragranceFamily": "string (identified from notes)",
  "matchingPerfumes": [
    {
      "name": "string",
      "brand": "string",
      "matchPercentage": "number (0-100)",
      "matchingNotes": ["string (which input notes appear in this perfume)"],
      "fragranceFamily": "string",
      "explanation": "string (why match is high or low)"
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Ingredient search
export function getSearchIngredientsPrompt(query: string): string {
  const prompt = `
Find fragrance ingredients matching the search: "${query}"

RESEARCH SCOPE:
- Real commercial fragrance ingredients (naturals: rose, jasmine, sandalwood; synthetics: galaxolide, iso-e-super; aroma chemicals)
- Include both common and lesser-known options
- Normalize names to commercial standards (e.g., "rose" → "rose absolute" or "rose oil")
- Provide 3-5 results with varying availability and price points

FOR EACH INGREDIENT INCLUDE:
- Scent profile (descriptive terms: "floral", "woody", "fresh", "sweet", "earthy")
- Primary role in fragrance (top/middle/base) - some ingredients work in multiple roles
- Typical usage percentage (how much is normal in formulas)
- Volatility (how fast it evaporates: high/medium/low)
- Real supplier options with realistic prices
- Availability status
- Common substitutes with similar scent/function
- Key characteristics (allergen status, stability, shelf life notes if relevant)

Price guidance:
- Synthetics: $30-100/100ml
- Naturals: $40-200+/100ml (depends on scarcity)
- Aroma chemicals: $25-80/100ml
`;

  const schema = `
{
  "query": "string (search input)",
  "results": "number (number of ingredients found)",
  "ingredients": [
    {
      "id": "string (machine-readable ID like 'rose-absolute')",
      "name": "string (commercial name)",
      "type": "string (natural|synthetic|aroma-chemical)",
      "scentProfile": ["string (4-6 descriptive terms)"],
      "role": "string (top|middle|base or 'top-middle'|'middle-base' if versatile)",
      "typicalUsagePercent": "number (realistic range: 0.5-25%)",
      "volatility": "string (high|medium|low)",
      "description": "string (2-3 sentences about character and use)",
      "naturalityNotes": "string (completely natural/synthetic/derivative info)",
      "commonCombinations": ["string (2-3 ingredients often paired with this)"],
      "substitutes": ["string (2-3 alternatives with similar profile)"],
      "supplier": {
        "name": "string",
        "price": "number (USD per 100ml)",
        "availability": "string (in-stock|limited|backordered)",
        "link": "string (optional)"
      }
    }
  ]
}

Example:
{
  "query": "rose",
  "ingredients": [
    {
      "id": "rose-absolute",
      "name": "rose absolute",
      "type": "natural",
      "scentProfile": ["floral", "sweet", "honeyed", "slightly animalic", "romantic"],
      "role": "middle",
      "typicalUsagePercent": 2,
      "volatility": "low",
      "substitutes": ["rose oil", "rose concrete", "phenylethyl alcohol"]
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}
