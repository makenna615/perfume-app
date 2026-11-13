"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ApiResponse, ShelfDetails, ShelfPerfume, ShelfStatus } from "@/types";
import { shelfKey } from "@/lib/shelf/model";

// One shared, in-memory copy of the shelf for the whole app, so the shelf page,
// "Add to shelf" buttons and "On your shelf" badges stay in sync without refetching.
interface State {
  items: ShelfPerfume[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

let state: State = { items: [], status: "idle", error: null };
const listeners = new Set<() => void>();
const SERVER_STATE: State = { items: [], status: "idle", error: null };

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Something went wrong. Please try again.");
  }
  return payload.data as T;
}

function sortItems(items: ShelfPerfume[]) {
  return [...items].sort(
    (a, b) => a.brand.localeCompare(b.brand, undefined, { sensitivity: "base" }) || a.name.localeCompare(b.name)
  );
}

export async function loadShelf(force = false) {
  if (state.status === "loading" || (state.status === "ready" && !force)) return;
  set({ status: "loading", error: null });
  try {
    set({ items: sortItems(await request<ShelfPerfume[]>("/api/shelf")), status: "ready" });
  } catch (error) {
    set({ status: "error", error: error instanceof Error ? error.message : "Couldn't load your shelf." });
  }
}

export interface NewShelfInput {
  name: string;
  brand: string;
  concentration?: string;
  status: ShelfStatus;
  sizeMl?: number | null;
  rating?: number | null;
  favorite?: boolean;
  privateNotes?: string;
  details?: ShelfDetails;
}

export async function addToShelf(input: NewShelfInput): Promise<ShelfPerfume> {
  const created = await request<ShelfPerfume>("/api/shelf", { method: "POST", body: JSON.stringify(input) });
  set({ items: sortItems([...state.items.filter((i) => i.id !== created.id), created]) });
  return created;
}

export async function updateShelfItem(id: string, patch: Record<string, unknown>): Promise<ShelfPerfume> {
  const updated = await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  set({ items: state.items.map((i) => (i.id === id ? updated : i)) });
  return updated;
}

export async function removeShelfItem(id: string): Promise<void> {
  await request<null>(`/api/shelf/${encodeURIComponent(id)}`, { method: "DELETE" });
  set({ items: state.items.filter((i) => i.id !== id) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useShelf() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);

  useEffect(() => {
    void loadShelf();
  }, []);

  const keys = useMemo(() => new Set(snapshot.items.map((i) => shelfKey(i.name, i.brand))), [snapshot.items]);
  const has = useCallback((name: string, brand: string) => keys.has(shelfKey(name, brand)), [keys]);

  return {
    items: snapshot.items,
    loading: snapshot.status === "loading" || snapshot.status === "idle",
    error: snapshot.error,
    has,
    reload: () => loadShelf(true),
  };
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

function replaceItem(updated: ShelfPerfume) {
  set({ items: state.items.map((i) => (i.id === updated.id ? updated : i)) });
  return updated;
}

/** Finds and stores a brand photo automatically. Resolves null if none was found. */
export async function findPhotoAuto(id: string): Promise<ShelfPerfume | null> {
  try {
    return replaceItem(
      await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}/photo`, {
        method: "PUT",
        body: JSON.stringify({ auto: true }),
      })
    );
  } catch {
    return null; // keeps the illustration — finding a photo is best-effort
  }
}

export async function choosePhoto(id: string, url: string, pageUrl?: string | null): Promise<ShelfPerfume> {
  return replaceItem(
    await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}/photo`, {
      method: "PUT",
      body: JSON.stringify({ url, pageUrl: pageUrl ?? undefined }),
    })
  );
}

export async function removePhoto(id: string): Promise<ShelfPerfume> {
  return replaceItem(await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}/photo`, { method: "DELETE" }));
}

export async function getPhotoCandidates(id: string): Promise<{ pageUrl: string | null; images: string[] }> {
  return request(`/api/shelf/${encodeURIComponent(id)}/photo/candidates`);
}

/**
 * Shrinks the photo in the browser before upload (max 1600px, JPEG). This keeps uploads
 * small enough for the server limit and drops the phone's EXIF/GPS data before it leaves
 * the device — the server re-encodes again as a second layer.
 */
async function shrinkForUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("That file isn't a supported image.");
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Couldn't process that image.");
  return blob;
}

export async function uploadPhoto(id: string, file: File): Promise<ShelfPerfume> {
  const form = new FormData();
  form.append("file", await shrinkForUpload(file), "photo.jpg");
  const response = await fetch(`/api/shelf/${encodeURIComponent(id)}/photo`, { method: "POST", body: form });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<ShelfPerfume>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || "Upload failed. Please try again.");
  }
  return replaceItem(payload.data);
}

/** Generates (or regenerates) the AI studio render from the stored photo (~20 s). */
export async function createRender(id: string): Promise<ShelfPerfume> {
  return replaceItem(await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}/photo/render`, { method: "POST" }));
}

export async function setPhotoDisplay(id: string, display: "render" | "photo" | "illustration"): Promise<ShelfPerfume> {
  return replaceItem(
    await request<ShelfPerfume>(`/api/shelf/${encodeURIComponent(id)}/photo`, {
      method: "PATCH",
      body: JSON.stringify({ display }),
    })
  );
}

/**
 * Finds the brand photo, then makes the AI render from it. Best-effort: if either step
 * fails the bottle keeps whatever it already has (illustration or photo).
 */
export async function findPhotoAndRender(id: string): Promise<ShelfPerfume | null> {
  const withPhoto = await findPhotoAuto(id);
  if (!withPhoto?.photo) return null;
  try {
    return await createRender(id);
  } catch {
    return withPhoto; // render failed — the real photo still shows
  }
}
