import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { requireSession } from "@/lib/auth/require-session";
import { shelfError } from "@/lib/shelf/errors";
import { isUuid } from "@/lib/shelf/server";
import { getShelfPerfume } from "@/lib/shelf/repository";
import { findPhotoCandidates, type PhotoCandidates } from "@/lib/shelf/photos";

type Context = { params: Promise<{ id: string }> };

/** Lists product photos found on the brand's site, for the photo picker. */
export async function GET(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ success: false, error: "Perfume not found." } as ApiResponse<null>, { status: 404 });
  }
  try {
    const item = await getShelfPerfume(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Perfume not found." } as ApiResponse<null>, { status: 404 });
    }
    const candidates = await findPhotoCandidates(item.name, item.brand, item.details.sources ?? []);
    return NextResponse.json({ success: true, data: candidates } as ApiResponse<PhotoCandidates>);
  } catch (error) {
    return shelfError(error, "search for photos");
  }
}
