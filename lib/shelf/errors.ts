import "server-only";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { DatabaseNotConfiguredError } from "@/lib/db/client";
import { DuplicateShelfPerfumeError } from "@/lib/shelf/repository";

/** Maps shelf errors to safe responses. Database errors are logged, never sent to the client. */
export function shelfError(error: unknown, action: string) {
  if (error instanceof DatabaseNotConfiguredError) {
    return NextResponse.json({ success: false, error: error.message } as ApiResponse<null>, { status: 503 });
  }
  if (error instanceof DuplicateShelfPerfumeError) {
    return NextResponse.json({ success: false, error: error.message } as ApiResponse<null>, { status: 409 });
  }
  console.error(`Shelf ${action} failed:`, error instanceof Error ? error.message : error);
  return NextResponse.json(
    { success: false, error: `Couldn't ${action}. Please try again.` } as ApiResponse<null>,
    { status: 500 }
  );
}
