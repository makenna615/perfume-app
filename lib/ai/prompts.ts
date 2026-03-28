// prompts.ts - Upgraded for Advanced AI Perfume Lab

export type OptimizationMode = "balanced" | "longevity" | "projection";

// Helper: Standard instructions for JSON enforcement and safe ingredients
function wrapJSONPrompt(prompt: string, schemaDescription: string): string {
  return `
You are a master perfumer AI. Follow these rules strictly:
- RETURN ONLY VALID JSON matching the schema below.
- DO NOT include markdown, explanations, or extra text outside JSON.
- USE ONLY REAL, COMMERCIAL PERFUME INGREDIENTS.
- Suggest safe substitutes for rare/expensive/unsafe ingredients if needed.
- Percentages must sum to 100 and be rounded to whole numbers.
- Try to include at least 1 top, 1 heart, and 1 base note for balance unless optimization mode dictates otherwise.

JSON Schema:
${schemaDescription}

${prompt}
`;
}

// Optimization guide helper
function getOptimizationGuide(mode: OptimizationMode): string {
  const guides: Record<OptimizationMode, string> = {
    longevity:
      "Prioritize base-note materials and fixatives for long-lasting wear. Focus on base-heavy structure.",
    projection:
      "Prioritize top and heart notes for strong throw and room presence.",
    balanced:
      "Balance top, heart, and base notes for smooth progression.",
  };
  return guides[mode];
}

// Similar perfumes prompt
export function getSimilarPerfumesPrompt(perfumeName: string): string {
  const prompt = `
A customer is looking for perfumes similar to "${perfumeName}".
You are an expert perfumer with 20+ years of experience.
Use your knowledge of commercial perfumes and fragrance families.

Find the 5 most similar perfumes and explain why, including:
1. Shared scent notes
2. Fragrance family (citrus, floral, woody, oriental, gourmand)
3. Overall character and feeling
`;

  const schema = `
{
  "basePerf": "string",
  "similarPerfumes": [
    {
      "name": "string",
      "brand": "string",
      "matchPercentage": "number",
      "sharedNotes": ["string"],
      "fragranceFamily": "string",
      "explanation": "string"
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
Create a unique perfume formula inspired by the vibe: "${vibe}".
Optimization Mode: ${optimizationMode.toUpperCase()} - ${guide}.
Scale formula to ${targetVolumeMl}ml.

Include top, heart, base notes with percentages summing to 100.
Include reasoning for each ingredient choice.
Include sensory 2-3 sentence description of the perfume.
Include timeline evolution for top/heart/base for visualization.
Include estimated cost based on typical supplier prices.
`;

  const schema = `
{
  "formulaName": "string",
  "vibe": "string",
  "optimizationMode": "string",
  "volumeMl": "number",
  "ingredients": [
    {
      "name": "string",
      "percentage": "number",
      "role": "top|middle|base",
      "reason": "string",
      "supplier": {
        "name": "string",
        "price": "number",
        "availability": "in-stock|limited|backordered",
        "link": "string"
      },
      "substitutes": ["string"]
    }
  ],
  "totalPercentage": "number",
  "description": "string",
  "timeline": {
    "top": "number",
    "heart": "number",
    "base": "number"
  },
  "estimatedCostUsd": "number"
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
  const prompt = `
Create a balanced perfume using ONLY these ingredients:
${ingredients.map((i) => `- ${i}`).join("\n")}

Optimization Mode: ${optimizationMode.toUpperCase()} - ${guide}.
Scale formula to ${targetVolumeMl}ml.
Include reasoning, timeline, top/heart/base percentages summing to 100, and cost.
`;

  const schema = `
{
  "formulaName": "string",
  "ingredients": [
    {
      "name": "string",
      "percentage": "number",
      "role": "top|middle|base",
      "reason": "string",
      "supplier": {
        "name": "string",
        "price": "number",
        "availability": "string",
        "link": "string"
      },
      "substitutes": ["string"]
    }
  ],
  "totalPercentage": "number",
  "volumeMl": "number",
  "description": "string",
  "timeline": {
    "top": "number",
    "heart": "number",
    "base": "number"
  },
  "estimatedCostUsd": "number",
  "tips": "string"
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
Create a NEW fragrance inspired by "${perfumeName}" but NOT a clone.
Optimization Mode: ${optimizationMode.toUpperCase()} - ${guide}.
Scale formula to ${targetVolumeMl}ml.
Include unique ingredients, top/heart/base breakdown, reasoning, timeline, and estimated cost.
`;

  const schema = `
{
  "formulaName": "string",
  "inspiration": "string",
  "ingredients": [
    {
      "name": "string",
      "percentage": "number",
      "role": "top|middle|base",
      "reason": "string",
      "supplier": {
        "name": "string",
        "price": "number",
        "availability": "string",
        "link": "string"
      },
      "substitutes": ["string"]
    }
  ],
  "totalPercentage": "number",
  "volumeMl": "number",
  "description": "string",
  "timeline": {
    "top": "number",
    "heart": "number",
    "base": "number"
  },
  "estimatedCostUsd": "number",
  "explanation": "string"
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Notes similarity
export function getNotesSimilarityPrompt(notes: string[]): string {
  const prompt = `
Find perfumes that best match these scent notes:
${notes.map((n) => `- ${n}`).join("\n")}
Return top 5 matches with explanation, shared notes, fragrance family, and similarity score.
`;

  const schema = `
{
  "inputNotes": ["string"],
  "matchingPerfumes": [
    {
      "name": "string",
      "matchPercentage": "number",
      "matchingNotes": ["string"],
      "fragranceFamily": "string",
      "explanation": "string"
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}

// Ingredient search
export function getSearchIngredientsPrompt(query: string): string {
  const prompt = `
Search for fragrance ingredients matching: "${query}".
Include detailed info, scent profile, top/heart/base role, volatility, typical usage, suppliers, price, availability, and substitutes.
`;

  const schema = `
{
  "query": "string",
  "ingredients": [
    {
      "id": "string",
      "name": "string",
      "scentProfile": ["string"],
      "role": "top|middle|base",
      "typicalUsagePercent": "number",
      "volatility": "high|medium|low",
      "description": "string",
      "substitutes": ["string"],
      "supplier": {
        "name": "string",
        "price": "number",
        "availability": "in-stock|limited|backordered",
        "link": "string"
      }
    }
  ]
}
`;

  return wrapJSONPrompt(prompt, schema);
}
