import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, ShelfPerfume } from "@/types";
import { requireSession } from "@/lib/auth/require-session";
import { createShelfPerfume, listShelf } from "@/lib/shelf/repository";
import { shelfError } from "@/lib/shelf/errors";
import { generateBottle, parseNewPerfume } from "@/lib/shelf/server";

export async function GET(request: NextRequest) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ success: true, data: await listShelf() } as ApiResponse<ShelfPerfume[]>);
  } catch (error) {
    return shelfError(error, "load your shelf");
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireSession(request);
  if (denied) return denied;
  try {
    const parsed = parseNewPerfume(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error } as ApiResponse<null>, { status: 400 });
    }
    const input = parsed.value;
    const bottle = await generateBottle(input.name, input.brand, input.concentration, input.details.fragranceFamily);
    const created = await createShelfPerfume({ ...input, bottle });
    return NextResponse.json({ success: true, data: created } as ApiResponse<ShelfPerfume>, { status: 201 });
  } catch (error) {
    return shelfError(error, "add this perfume");
  }
}
