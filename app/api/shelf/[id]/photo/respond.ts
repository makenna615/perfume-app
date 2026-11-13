import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { AIServiceError } from "@/lib/ai/types";
import { shelfError } from "@/lib/shelf/errors";
import { PhotoError } from "@/lib/shelf/photos";

// Shared response helpers for the photo routes (not a route file).

export const json = (body: ApiResponse<unknown>, status = 200) => NextResponse.json(body, { status });
export const notFound = (what = "Perfume not found.") => json({ success: false, error: what }, 404);

export function photoError(error: unknown, action: string) {
  if (error instanceof PhotoError) return json({ success: false, error: error.message }, 422);
  if (error instanceof AIServiceError) return json({ success: false, error: error.message }, error.status);
  const name = error instanceof Error ? error.name : "";
  if (/Blob/.test(name)) {
    console.error(`Photo ${action} failed:`, (error as Error).message);
    return json({ success: false, error: "Photo storage isn't available right now." }, 503);
  }
  return shelfError(error, action);
}
