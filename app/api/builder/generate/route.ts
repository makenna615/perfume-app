import { NextRequest, NextResponse } from "next/server";
import {
  ApiResponse,
  BuilderMode,
  Formula,
  FormulaIngredient,
  OptimizationMode,
} from "@/types";
import { getAIService } from "@/lib/ai/factory";
import {
  getFormulaFromIngredientsPrompt,
  getFormulaFromVibePrompt,
  getInspiredByFormulaPrompt,
} from "@/lib/ai/prompts";
import { AIServiceError } from "@/lib/ai/types";
import {
  CONFIDENCE,
  COST_TIERS,
  MAX_INPUT_LENGTH,
  noteRole,
  num,
  obj,
  oneOf,
  slug,
  str,
  strArr,
} from "@/lib/ai/sanitize";

const MODES: readonly BuilderMode[] = ["vibe", "ingredients", "inspired"];
const OPTIMIZATIONS: readonly OptimizationMode[] = ["balanced", "longevity", "projection"];
const DILUTIONS = ["100%", "10%", "1%"] as const;

function sanitizeIngredients(value: unknown): FormulaIngredient[] {
  const seen = new Set<string>();
  const items = (Array.isArray(value) ? value : [])
    .map(obj)
    .filter((item): item is Record<string, unknown> => Boolean(item && str(item.name)))
    .map((item) => {
      const name = str(item.name, 100)!;
      return {
        ingredientId: slug(name),
        ingredientName: name,
        percentage: num(item.percentage, 0, 100) ?? 0,
        role: noteRole(item.role),
        dilution: oneOf(item.dilution, DILUTIONS) ?? "100%",
        reason: str(item.reason, 300),
        substitutes: strArr(item.substitutes, 3),
        costTier: oneOf(item.costTier, COST_TIERS),
        safetyNote: str(item.safetyNote, 300),
      } satisfies FormulaIngredient;
    })
    .filter((item) => {
      if (item.percentage <= 0 || seen.has(item.ingredientId)) return false;
      seen.add(item.ingredientId);
      return true;
    });

  // Always normalise to exactly 100.0 (models are often off by a few percent).
  const total = items.reduce((sum, item) => sum + item.percentage, 0);
  if (total <= 0) return [];
  const normalized = items.map((item) => ({
    ...item,
    percentage: Math.round((item.percentage / total) * 1000) / 10,
  }));
  const drift = Math.round((100 - normalized.reduce((s, i) => s + i.percentage, 0)) * 10) / 10;
  if (drift !== 0) {
    const largest = normalized.reduce((a, b) => (b.percentage > a.percentage ? b : a));
    largest.percentage = Math.round((largest.percentage + drift) * 10) / 10;
  }

  const order = { top: 0, middle: 1, base: 2 } as const;
  return normalized.sort(
    (a, b) => order[a.role ?? "middle"] - order[b.role ?? "middle"] || b.percentage - a.percentage
  );
}

function sanitizeFormula(
  raw: Record<string, unknown>,
  mode: BuilderMode,
  input: string,
  optimizationMode: OptimizationMode
): Formula {
  const timeline = obj(raw.timeline);
  const concentration = obj(raw.recommendedConcentration);
  const reference = obj(raw.reference);
  const refNotes = obj(reference?.notes);

  return {
    name: str(raw.formulaName, 80) ?? "Untitled Formula",
    mode,
    input,
    concept: str(raw.concept, 400),
    olfactiveFamily: str(raw.olfactiveFamily, 60),
    description: str(raw.description, 600),
    inspiration: input,
    optimizationMode,
    ingredients: sanitizeIngredients(raw.ingredients),
    timeline: timeline
      ? {
          opening: str(timeline.opening, 300),
          heart: str(timeline.heart, 300),
          drydown: str(timeline.drydown, 300),
        }
      : undefined,
    recommendedConcentration:
      concentration && num(concentration.percent, 1, 40)
        ? {
            type: str(concentration.type, 40) ?? "Eau de Parfum",
            percent: num(concentration.percent, 1, 40)!,
            why: str(concentration.why, 300),
          }
        : undefined,
    maceration: str(raw.maceration, 400),
    tips: strArr(raw.tips, 5, 300),
    warnings: strArr(raw.warnings, 5, 300),
    suggestedAdditions: (Array.isArray(raw.suggestedAdditions) ? raw.suggestedAdditions : [])
      .map(obj)
      .filter((item): item is Record<string, unknown> => Boolean(item && str(item.name)))
      .slice(0, 3)
      .map((item) => ({ name: str(item.name, 100)!, role: noteRole(item.role), why: str(item.why, 300) })),
    reference:
      reference && str(reference.name)
        ? {
            name: str(reference.name, 120)!,
            brand: str(reference.brand, 120),
            notes: {
              top: strArr(refNotes?.top, 8),
              middle: strArr(refNotes?.middle, 8),
              base: strArr(refNotes?.base, 8),
            },
            confidence: oneOf(reference.confidence, CONFIDENCE),
          }
        : undefined,
    keyDifferences: strArr(raw.keyDifferences, 4, 300),
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      mode?: unknown;
      input?: unknown;
      optimizationMode?: unknown;
    };
    const mode = oneOf(body.mode, MODES);
    const input = typeof body.input === "string" ? body.input.trim().slice(0, MAX_INPUT_LENGTH) : "";
    const optimizationMode = oneOf(body.optimizationMode, OPTIMIZATIONS) ?? "balanced";

    if (!mode || !input) {
      return NextResponse.json(
        { success: false, error: "Mode and input are required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    let promptPair;
    if (mode === "vibe") {
      promptPair = getFormulaFromVibePrompt(input, optimizationMode);
    } else if (mode === "ingredients") {
      const ingredients = input
        .split(/[,\n]/)
        .map((ingredient) => ingredient.trim())
        .filter(Boolean)
        .slice(0, 20);
      if (ingredients.length < 2) {
        return NextResponse.json(
          { success: false, error: "List at least two materials, separated by commas." } as ApiResponse<null>,
          { status: 400 }
        );
      }
      promptPair = getFormulaFromIngredientsPrompt(ingredients, optimizationMode);
    } else {
      promptPair = getInspiredByFormulaPrompt(input, optimizationMode);
    }

    const raw = await getAIService().generateJSON({ task: "formula", ...promptPair });
    const formula = sanitizeFormula(raw, mode, input, optimizationMode);

    if (formula.ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "The AI returned an empty formula. Please try again." } as ApiResponse<null>,
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: formula } as ApiResponse<Formula>);
  } catch (error) {
    console.error("Formula generation error:", error);
    const status = error instanceof AIServiceError ? error.status : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof AIServiceError ? error.message : "Failed to generate formula",
      } as ApiResponse<null>,
      { status }
    );
  }
}
