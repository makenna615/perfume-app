import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, SimilarPerfume, SimilarRelationship, SimilarSearchResult } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getNotesSimilarityPrompt, getSimilarPerfumesPrompt } from "@/lib/ai/prompts";
import { AIServiceError } from "@/lib/ai/types";
import {
  MAX_INPUT_LENGTH,
  PRICE_TIERS,
  num,
  obj,
  oneOf,
  slug,
  str,
  strArr,
  year,
} from "@/lib/ai/sanitize";

const RELATIONSHIPS: readonly SimilarRelationship[] = [
  "dupe",
  "close-alternative",
  "flanker",
  "same-family",
];

function sanitize(raw: Record<string, unknown>): SimilarSearchResult {
  const ref = obj(raw.reference);
  const reference =
    ref && str(ref.name)
      ? {
          name: str(ref.name, 120)!,
          brand: str(ref.brand, 120) ?? "",
          concentration: str(ref.concentration, 40),
          releaseYear: year(ref.releaseYear),
          fragranceFamily: str(ref.fragranceFamily, 60),
          keyNotes: strArr(ref.keyNotes, 8),
          character: str(ref.character, 300),
        }
      : null;

  const seen = new Set<string>();
  const results: SimilarPerfume[] = (Array.isArray(raw.results) ? raw.results : [])
    .map(obj)
    .filter((item): item is Record<string, unknown> => Boolean(item && str(item.name)))
    .map((item) => {
      const name = str(item.name, 120)!;
      const brand = str(item.brand, 120) ?? "";
      return {
        id: slug(`${brand}-${name}`),
        name,
        brand,
        relationship: oneOf(item.relationship, RELATIONSHIPS) ?? "same-family",
        matchPercentage: Math.round(num(item.matchPercentage, 0, 100) ?? 0),
        priceTier: oneOf(item.priceTier, PRICE_TIERS),
        sharedNotes: strArr(item.sharedNotes, 8),
        keyDifference: str(item.keyDifference, 300),
        explanation: str(item.explanation, 400) ?? "",
      };
    })
    // Drop duplicates and the reference perfume itself.
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return !(reference && item.name.toLowerCase() === reference.name.toLowerCase() && item.brand.toLowerCase() === reference.brand.toLowerCase());
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return { found: raw.found !== false && results.length > 0, reference, results };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: unknown; searchType?: unknown };
    const query = typeof body.query === "string" ? body.query.trim().slice(0, MAX_INPUT_LENGTH) : "";
    const searchType = body.searchType;

    if (!query || (searchType !== "perfume" && searchType !== "notes")) {
      return NextResponse.json(
        { success: false, error: "A query and a valid searchType are required." } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const promptPair =
      searchType === "perfume"
        ? getSimilarPerfumesPrompt(query)
        : getNotesSimilarityPrompt(
            query
              .split(",")
              .map((note) => note.trim())
              .filter(Boolean)
              .slice(0, 12)
          );

    const raw = await getAIService().generateJSON({
      task: searchType === "perfume" ? "similar-perfumes" : "notes-search",
      ...promptPair,
    });

    return NextResponse.json({ success: true, data: sanitize(raw) } as ApiResponse<SimilarSearchResult>);
  } catch (error) {
    console.error("Perfume search error:", error);
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
