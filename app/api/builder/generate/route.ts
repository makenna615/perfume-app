import { NextRequest, NextResponse } from "next/server";
import { Formula, ApiResponse } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import {
  getFormulaFromVibePrompt,
  getFormulaFromIngredientsPrompt,
  getInspiredByFormulaPrompt,
  OptimizationMode,
} from "@/lib/ai/prompts";

type BuilderMode = "vibe" | "ingredients" | "inspired";

interface BuilderRequestBody {
  mode?: BuilderMode;
  input?: string;
  optimizationMode?: OptimizationMode;
}

interface ParsedFormulaIngredient {
  name?: string;
  percentage?: number;
  role?: "top" | "middle" | "base";
}

interface ParsedFormulaResponse {
  formulaName?: string;
  vibe?: string;
  inspiration?: string;
  optimizationMode?: OptimizationMode;
  ingredients?: ParsedFormulaIngredient[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BuilderRequestBody;
    const mode = body.mode;
    const input = body.input?.trim();
    const optimizationMode = body.optimizationMode ?? "balanced";

    if (!mode || !input) {
      return NextResponse.json(
        { success: false, error: "Mode and input are required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const aiService = getAIService();
    let prompt: string;

    if (mode === "vibe") {
      prompt = getFormulaFromVibePrompt(input, optimizationMode);
    } else if (mode === "ingredients") {
      const ingredients = input
        .split(",")
        .map((ingredient) => ingredient.trim())
        .filter(Boolean);
      prompt = getFormulaFromIngredientsPrompt(ingredients, optimizationMode);
    } else if (mode === "inspired") {
      prompt = getInspiredByFormulaPrompt(input, optimizationMode);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid mode" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const aiResponse = await aiService.generateFormula(prompt);
    const parsed = JSON.parse(aiResponse) as ParsedFormulaResponse;
    const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

    const formula: Formula = {
      name: parsed.formulaName || "Custom Formula",
      inspiration: parsed.vibe || parsed.inspiration || input,
      optimizationMode: parsed.optimizationMode || optimizationMode,
      ingredients: ingredients
        .filter((ing) => ing.name && typeof ing.percentage === "number")
        .map((ing) => ({
          ingredientId: String(ing.name).toLowerCase().replace(/\s+/g, "-"),
          ingredientName: String(ing.name),
          percentage: Number(ing.percentage),
          role: ing.role,
        })),
      baseVolume: 50,
    };

    if (formula.ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty formula" } as ApiResponse<null>,
        { status: 502 }
      );
    }

    const total = formula.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.percentage,
      0
    );
    formula.ingredients = formula.ingredients.map((ingredient) => ({
      ...ingredient,
      percentage: Number(ingredient.percentage.toFixed(2)),
    }));

    if (total > 100) {
      formula.ingredients = formula.ingredients.map((ingredient) => ({
        ...ingredient,
        percentage: Number(((ingredient.percentage / total) * 100).toFixed(2)),
      }));
    };

    return NextResponse.json({
      success: true,
      data: formula,
    } as ApiResponse<Formula>);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate formula" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
