import { NextRequest } from "next/server";
import type { ApiResponse, ShelfPerfume } from "@/types";
import { requireSession } from "@/lib/auth/require-session";
import { isUuid } from "@/lib/shelf/server";
import { getShelfPerfume, getStoredPhoto, setShelfPhoto } from "@/lib/shelf/repository";
import {
  MAX_UPLOAD_BYTES,
  deletePhotoFiles,
  findAndStoreBestPhoto,
  readStoredPhoto,
  storePhotoFromUrl,
  storeUploadedPhoto,
  type StoredPhoto,
} from "@/lib/shelf/photos";
import { json, notFound, photoError } from "./respond";

type Context = { params: Promise<{ id: string }> };

// The automatic search can take a while (web search + downloads).
export const maxDuration = 60;

/** Saves a new photo record, then deletes the files it replaced (old photo and its render). */
async function attach(id: string, stored: StoredPhoto) {
  let result;
  try {
    result = await setShelfPhoto(id, stored);
  } catch (error) {
    await deletePhotoFiles(stored); // never leave an orphaned file if the database write fails
    throw error;
  }
  if (!result) {
    await deletePhotoFiles(stored); // item was deleted meanwhile
    return notFound();
  }
  if (result.previous && result.previous.pathname !== stored.pathname) await deletePhotoFiles(result.previous);
  return json({ success: true, data: result.item } as ApiResponse<ShelfPerfume>);
}

/** Serves the private photo (?kind=render for the AI render). Only reachable when logged in. */
export async function GET(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const photo = await getStoredPhoto(id);
    const pathname = request.nextUrl.searchParams.get("kind") === "render" ? photo?.render?.pathname : photo?.pathname;
    if (!pathname) return notFound("No photo.");
    const blob = await readStoredPhoto(pathname);
    if (!blob || blob.statusCode !== 200) return notFound("No photo.");
    return new Response(blob.stream, {
      headers: {
        "Content-Type": "image/webp", // we only ever store re-encoded WebP
        "Cache-Control": "private, max-age=31536000, immutable", // URL is versioned
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return photoError(error, "load this photo");
  }
}

/** Sets the photo from the web: { auto: true } finds the best one; { url } uses a chosen image. */
export async function PUT(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const body = (await request.json().catch(() => null)) as { auto?: unknown; url?: unknown; pageUrl?: unknown } | null;
    const item = await getShelfPerfume(id);
    if (!item) return notFound();

    if (body?.auto === true) {
      const stored = await findAndStoreBestPhoto(id, item.name, item.brand, item.details.sources ?? []);
      return stored ? attach(id, stored) : json({ success: false, error: "No product photo found for this perfume." }, 404);
    }

    if (typeof body?.url === "string" && body.url.length <= 2000) {
      const pageUrl = typeof body.pageUrl === "string" && /^https:\/\//i.test(body.pageUrl) ? body.pageUrl.slice(0, 2000) : undefined;
      return attach(id, await storePhotoFromUrl(id, body.url, pageUrl));
    }

    return json({ success: false, error: "Send { auto: true } or { url }." }, 400);
  } catch (error) {
    return photoError(error, "save this photo");
  }
}

/** Uploads your own photo (multipart form field "file"). */
export async function POST(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  // Reject oversized bodies before reading them into memory.
  if (Number(request.headers.get("content-length") || 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return json({ success: false, error: "Photos must be 5 MB or smaller." }, 413);
  }
  try {
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File) || file.size === 0) return json({ success: false, error: "Choose an image file." }, 400);
    if (file.size > MAX_UPLOAD_BYTES) return json({ success: false, error: "Photos must be 5 MB or smaller." }, 413);
    if (!(await getShelfPerfume(id))) return notFound();
    return attach(id, await storeUploadedPhoto(id, Buffer.from(await file.arrayBuffer())));
  } catch (error) {
    return photoError(error, "upload this photo");
  }
}

/** Chooses what the shelf shows: { display: "render" | "photo" | "illustration" }. */
export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const body = (await request.json().catch(() => null)) as { display?: unknown } | null;
    const display = body?.display;
    if (display !== "render" && display !== "photo" && display !== "illustration") {
      return json({ success: false, error: "Invalid display option." }, 400);
    }
    const photo = await getStoredPhoto(id);
    if (!photo) return notFound("No photo.");
    if (display === "render" && !photo.render) return json({ success: false, error: "No render yet." }, 409);
    const result = await setShelfPhoto(id, { ...photo, display });
    return result ? json({ success: true, data: result.item } as ApiResponse<ShelfPerfume>) : notFound();
  } catch (error) {
    return photoError(error, "update this photo");
  }
}

/** Removes the photo and its render (the bottle goes back to its illustration). */
export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await requireSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  try {
    const result = await setShelfPhoto(id, null);
    if (!result) return notFound();
    await deletePhotoFiles(result.previous);
    return json({ success: true, data: result.item } as ApiResponse<ShelfPerfume>);
  } catch (error) {
    return photoError(error, "remove this photo");
  }
}
