import { NextRequest } from "next/server";
import type { ApiResponse, ShelfPerfume } from "@/types";
import { requireSession } from "@/lib/auth/require-session";
import { isUuid } from "@/lib/shelf/server";
import { getShelfPerfume, getStoredPhoto, setShelfPhoto } from "@/lib/shelf/repository";
import { deleteStoredPhoto, generateRender } from "@/lib/shelf/photos";
import { json, notFound, photoError } from "../respond";

type Context = { params: Promise<{ id: string }> };

// Image generation can take ~20 s; allow headroom on serverless.
export const maxDuration = 120;

/** Generates (or regenerates) the AI studio render from the stored real photo. */
export async function POST(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const [item, photo] = await Promise.all([getShelfPerfume(id), getStoredPhoto(id)]);
    if (!item) return notFound();
    if (!photo) return json({ success: false, error: "Add a photo first — the render is made from it." }, 409);

    const render = await generateRender(id, photo, item.name, item.brand);
    let result;
    try {
      result = await setShelfPhoto(id, { ...photo, render, display: "render" });
    } catch (error) {
      await deleteStoredPhoto(render.pathname); // never leave an orphaned file if the database write fails
      throw error;
    }
    if (!result) {
      await deleteStoredPhoto(render.pathname);
      return notFound();
    }
    const replaced = result.previous?.render?.pathname;
    if (replaced && replaced !== render.pathname) await deleteStoredPhoto(replaced);
    return json({ success: true, data: result.item } as ApiResponse<ShelfPerfume>);
  } catch (error) {
    return photoError(error, "create the render");
  }
}
