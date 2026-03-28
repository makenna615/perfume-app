import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Ingredient } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getSearchIngredientsPrompt } from "@/lib/ai/prompts";
import { getIngredientSupplierData } from "@/lib/utils/ingredientMarket";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const prompt = getSearchIngredientsPrompt(query);
    const aiResponse = await aiService.getIngredientInfo(prompt);
    const parsed = JSON.parse(aiResponse);
    const aiIngredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const results: Ingredient[] = aiIngredients.map((ingredient: Ingredient) => ({
      ...ingredient,
      supplier:
        ingredient.supplier ||
        getIngredientSupplierData(ingredient.name, ingredient.id),
    }));

    return NextResponse.json({
      success: true,
      data: results,
    } as ApiResponse<Ingredient[]>);
  } catch (error) {
    console.error("Ingredient search error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
