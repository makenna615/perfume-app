import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, ShelfPerfume } from "@/types";
import { requireSession } from "@/lib/auth/require-session";
import { deleteShelfPerfume, updateShelfPerfume } from "@/lib/shelf/repository";
import { isUuid, parsePatch } from "@/lib/shelf/server";
import { shelfError } from "@/lib/shelf/errors";
import { deletePhotoFiles } from "@/lib/shelf/photos";

type Context = { params: Promise<{ id: string }> };

function notFound() {
  return NextResponse.json({ success: false, error: "Perfume not found." } as ApiResponse<null>, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const parsed = parsePatch(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error } as ApiResponse<null>, { status: 400 });
    }
    const updated = await updateShelfPerfume(id, parsed.value);
    return updated
      ? NextResponse.json({ success: true, data: updated } as ApiResponse<ShelfPerfume>)
      : notFound();
  } catch (error) {
    return shelfError(error, "update this perfume");
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const deleted = await deleteShelfPerfume(id);
    if (!deleted) return notFound();
    await deletePhotoFiles(deleted.photo); // photo + render; best-effort, never blocks the delete
    return NextResponse.json({ success: true } as ApiResponse<null>);
  } catch (error) {
    return shelfError(error, "remove this perfume");
  }
}
