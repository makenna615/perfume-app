import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Material, MaterialSearchResult } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getSearchIngredientsPrompt } from "@/lib/ai/prompts";
import { AIServiceError } from "@/lib/ai/types";
import {
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

const TYPES = ["natural", "synthetic", "natural isolate", "specialty base"] as const;
const VOLATILITY = ["high", "medium", "low"] as const;

function sanitizeMaterial(item: Record<string, unknown>): Material | null {
  const name = str(item.name, 100);
  if (!name) return null;
  const role = noteRole(item.role) ?? "middle";

  return {
    id: slug(str(item.id, 80) ?? name),
    name,
    otherNames: strArr(item.otherNames, 4, 120),
    type: oneOf(item.type, TYPES) ?? "natural",
    family: str(item.family, 40),
    scentProfile: strArr(item.scentProfile, 6, 40),
    description: str(item.description, 700) ?? "",
    role,
    volatility:
      oneOf(item.volatility, VOLATILITY) ?? (role === "top" ? "high" : role === "base" ? "low" : "medium"),
    tenacity: str(item.tenacity, 60),
    typicalUsage: str(item.typicalUsage, 80),
    typicalUsagePercent: num(item.typicalUsagePercent, 0, 100),
    recommendedDilution: str(item.recommendedDilution, 160),
    safety: str(item.safety, 300),
    allergens: strArr(item.allergens, 10, 40),
    pairsWith: strArr(item.pairsWith, 4),
    substitutes: strArr(item.substitutes, 4),
    foundIn: (Array.isArray(item.foundIn) ? item.foundIn : [])
      .map(obj)
      .filter((p): p is Record<string, unknown> => Boolean(p && str(p.name)))
      .slice(0, 3)
      .map((p) => ({ name: str(p.name, 100)!, brand: str(p.brand, 100) ?? "" })),
    costTier: oneOf(item.costTier, COST_TIERS),
  };
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, MAX_INPUT_LENGTH);

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const raw = await getAIService().generateJSON({
      task: "ingredient-search",
      ...getSearchIngredientsPrompt(query),
    });

    const seen = new Set<string>();
    const materials = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
      .map(obj)
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map(sanitizeMaterial)
      .filter((item): item is Material => {
        if (!item || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

    return NextResponse.json({
      success: true,
      data: { query, interpretation: str(raw.interpretation, 300), materials },
    } as ApiResponse<MaterialSearchResult>);
  } catch (error) {
    console.error("Ingredient search error:", error);
    const status = error instanceof AIServiceError ? error.status : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof AIServiceError ? error.message : "Search failed. Please try again.",
      } as ApiResponse<null>,
      { status }
    );
  }
}
