import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Perfume } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getSimilarPerfumesPrompt, getNotesSimilarityPrompt } from "@/lib/ai/prompts";

interface ParsedPerfumeResult {
  name?: string;
  brand?: string;
  matchPercentage?: number;
  sharedNotes?: string[];
  matchingNotes?: string[];
  explanation?: string;
}

interface ParsedPerfumeResponse {
  similarPerfumes?: ParsedPerfumeResult[];
  matchingPerfumes?: ParsedPerfumeResult[];
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchType } = await request.json();

    if (!query || !searchType) {
      return NextResponse.json(
        { success: false, error: "Query and searchType are required" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const aiService = getAIService();
    let aiResponse: string;

    if (searchType === "perfume") {
      const prompt = getSimilarPerfumesPrompt(query);
      aiResponse = await aiService.generateSimilarPerfumes(prompt);
    } else if (searchType === "notes") {
      const notes = query.split(",").map((n: string) => n.trim());
      const prompt = getNotesSimilarityPrompt(notes);
      aiResponse = await aiService.generateSimilarPerfumes(prompt);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid searchType" } as ApiResponse<null>,
        { status: 400 }
      );
    }

    let parsed: ParsedPerfumeResponse;
    try {
      parsed = JSON.parse(aiResponse) as ParsedPerfumeResponse;
    } catch {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { success: false, error: "Invalid response format from AI" } as ApiResponse<null>,
        { status: 500 }
      );
    }

    let results: ParsedPerfumeResult[] = [];

    if (searchType === "perfume") {
      results = Array.isArray(parsed.similarPerfumes) ? parsed.similarPerfumes : [];
    } else if (searchType === "notes") {
      results = Array.isArray(parsed.matchingPerfumes) ? parsed.matchingPerfumes : [];
    }

    if (!Array.isArray(results)) {
      results = [];
    }

    // Map results to Perfume type with validation
    const mappedResults: Perfume[] = results
      .filter((result) => result && typeof result === "object")
      .map((result, index: number) => {
        const allNotes = Array.isArray(result.sharedNotes) 
          ? result.sharedNotes 
          : Array.isArray(result.matchingNotes) 
          ? result.matchingNotes 
          : [];

        // Distribute notes across top/middle/base for realistic display
        const topNotes = allNotes.slice(0, 2);
        const middleNotes = allNotes.slice(2, 4);
        const baseNotes = allNotes.slice(4, 6);

        return {
          id: `perfume-${index}-${Date.now()}`,
          name: String(result.name || "Unknown Perfume"),
          brand: String(result.brand || "Unknown Brand"),
          topNotes,
          middleNotes,
          baseNotes,
          description: String(result.explanation || ""),
          similarityScore: Math.min(100, Math.max(0, Number(result.matchPercentage) || 0)),
        };
      });

    return NextResponse.json({
      success: true,
      data: mappedResults,
    } as ApiResponse<Perfume[]>);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
