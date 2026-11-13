import "server-only";
import type { BottleSpec, ShelfStatus } from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getBottlePrompt } from "@/lib/ai/prompts";
import { num, obj, oneOf, str } from "@/lib/ai/sanitize";
import { LIMITS, SHELF_STATUSES, defaultBottle, parseRating, sanitizeBottle, sanitizeDetails } from "@/lib/shelf/model";
import type { NewShelfPerfume, ShelfPerfumePatch } from "@/lib/shelf/repository";

/** Ask the model what the real bottle looks like. Never throws — falls back to a generic bottle. */
export async function generateBottle(
  name: string,
  brand: string,
  concentration: string,
  family?: string
): Promise<BottleSpec> {
  try {
    const raw = await getAIService().generateJSON({ task: "bottle", ...getBottlePrompt(name, brand, concentration) });
    if (Object.keys(raw).length === 0) return defaultBottle(family);
    return sanitizeBottle({ ...raw, accuracy: raw.known === true ? "known" : "approximate" }, family);
  } catch (error) {
    console.warn("Bottle generation failed; using generic bottle.", error instanceof Error ? error.message : "");
    return defaultBottle(family);
  }
}

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

function parseSize(value: unknown): number | null | undefined {
  if (value === null || value === "") return null;
  if (value === undefined) return undefined;
  const n = num(value, 0.1, 5000);
  return n === undefined ? undefined : Math.round(n * 10) / 10;
}

function textField(value: unknown, max: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, max);
}

/** Validates the body of POST /api/shelf. Unknown fields are ignored. */
export function parseNewPerfume(body: unknown): Parsed<Omit<NewShelfPerfume, "bottle">> {
  const b = obj(body);
  if (!b) return { ok: false, error: "Invalid request body." };

  const name = str(b.name, LIMITS.name);
  if (!name) return { ok: false, error: "A perfume name is required." };

  const status = b.status === undefined ? "full" : oneOf(b.status, SHELF_STATUSES);
  if (!status) return { ok: false, error: "Invalid status." };

  const sizeMl = parseSize(b.sizeMl);
  if (b.sizeMl !== undefined && b.sizeMl !== null && b.sizeMl !== "" && sizeMl === undefined) {
    return { ok: false, error: "Bottle size must be between 0.1 and 5000 ml." };
  }
  const rating = parseRating(b.rating);
  if (b.rating !== undefined && b.rating !== null && rating === undefined) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }

  return {
    ok: true,
    value: {
      name,
      brand: str(b.brand, LIMITS.brand) ?? "",
      concentration: str(b.concentration, LIMITS.concentration) ?? "",
      status: status as ShelfStatus,
      sizeMl: sizeMl ?? null,
      rating: rating ?? null,
      favorite: b.favorite === true,
      privateNotes: textField(b.privateNotes, LIMITS.privateNotes) ?? "",
      details: sanitizeDetails(b.details),
    },
  };
}

/** Validates the body of PATCH /api/shelf/[id]. Only listed fields can change. */
export function parsePatch(body: unknown, family?: string): Parsed<ShelfPerfumePatch> {
  const b = obj(body);
  if (!b) return { ok: false, error: "Invalid request body." };
  const patch: ShelfPerfumePatch = {};

  if (b.status !== undefined) {
    const status = oneOf(b.status, SHELF_STATUSES);
    if (!status) return { ok: false, error: "Invalid status." };
    patch.status = status;
  }
  if (b.sizeMl !== undefined) {
    const size = parseSize(b.sizeMl);
    if (size === undefined) return { ok: false, error: "Bottle size must be between 0.1 and 5000 ml." };
    patch.sizeMl = size;
  }
  if (b.rating !== undefined) {
    const rating = parseRating(b.rating);
    if (rating === undefined) return { ok: false, error: "Rating must be between 1 and 5." };
    patch.rating = rating;
  }
  if (b.favorite !== undefined) {
    if (typeof b.favorite !== "boolean") return { ok: false, error: "Invalid favorite value." };
    patch.favorite = b.favorite;
  }
  if (b.privateNotes !== undefined) {
    const notes = textField(b.privateNotes, LIMITS.privateNotes);
    if (notes === undefined) return { ok: false, error: "Invalid notes." };
    patch.privateNotes = notes;
  }
  if (b.bottle !== undefined) {
    patch.bottle = sanitizeBottle(b.bottle, family);
  }

  if (Object.keys(patch).length === 0) return { ok: false, error: "Nothing to update." };
  return { ok: true, value: patch };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
