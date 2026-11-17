import { NextRequest } from "next/server";
import { isUuid } from "@/lib/shelf/server";
import { getPublicRenderPath } from "@/lib/shelf/repository";
import { readStoredPhoto } from "@/lib/shelf/photos";

type Context = { params: Promise<{ id: string }> };

const notFound = () => new Response("Not found", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });

/**
 * Public: serves only the AI render of a bottle on the public collection (not wishlist, and only
 * when the owner chose "Render"). The original product photo is never served here.
 */
export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const pathname = await getPublicRenderPath(id);
    if (!pathname) return notFound();
    const blob = await readStoredPhoto(pathname);
    if (!blob || blob.statusCode !== 200) return notFound();
    return new Response(blob.stream, {
      headers: {
        "Content-Type": "image/webp", // we only ever store re-encoded WebP
        // Short cache so hiding a bottle (wishlist / illustration) takes effect soon.
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
