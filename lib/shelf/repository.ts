import "server-only";
import type { BottleSpec, PublicShelfPerfume, ShelfDetails, ShelfPerfume, ShelfPhoto, ShelfStatus } from "@/types";
import type { StoredPhoto } from "@/lib/shelf/photos";
import { getSql } from "@/lib/db/client";
import { sanitizeBottle, sanitizeDetails } from "@/lib/shelf/model";

type Row = Record<string, unknown>;

/** Internal photo record → what the browser gets (an authenticated, versioned app URL). */
function toPhoto(id: string, raw: unknown): ShelfPhoto | undefined {
  const p = raw && typeof raw === "object" ? (raw as Partial<StoredPhoto>) : null;
  if (!p?.pathname || !p.updatedAt) return undefined;
  const render = p.render?.pathname && p.render.updatedAt ? p.render : undefined;
  const display =
    p.display === "illustration" || p.display === "photo" ? p.display : p.display === "render" && render ? "render" : "photo";
  return {
    src: `/api/shelf/${id}/photo?v=${encodeURIComponent(p.updatedAt)}`,
    ...(render ? { renderSrc: `/api/shelf/${id}/photo?kind=render&v=${encodeURIComponent(render.updatedAt)}` } : {}),
    display,
    origin: p.origin === "upload" ? "upload" : "brand",
    ...(p.sourceUrl ? { sourceUrl: p.sourceUrl } : {}),
    width: Number(p.width) || 0,
    height: Number(p.height) || 0,
  };
}

function toShelfPerfume(row: Row): ShelfPerfume {
  const details = sanitizeDetails(row.details);
  return {
    id: String(row.id),
    name: String(row.name),
    brand: String(row.brand ?? ""),
    concentration: String(row.concentration ?? ""),
    status: row.status as ShelfStatus,
    sizeMl: row.size_ml === null || row.size_ml === undefined ? undefined : Number(row.size_ml),
    rating: row.rating === null || row.rating === undefined ? undefined : Number(row.rating),
    favorite: Boolean(row.favorite),
    privateNotes: String(row.private_notes ?? ""),
    details,
    bottle: sanitizeBottle(row.bottle, details.fragranceFamily),
    photo: toPhoto(String(row.id), row.photo),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

// Built field-by-field from an explicit allow-list, so a private column can never leak
// to the public page even if the query below were changed to SELECT *.
function toPublicPerfume(row: Row): PublicShelfPerfume {
  const details = sanitizeDetails(row.details);
  return {
    id: String(row.id),
    name: String(row.name),
    brand: String(row.brand ?? ""),
    concentration: String(row.concentration ?? ""),
    status: row.status as PublicShelfPerfume["status"],
    rating: row.rating === null || row.rating === undefined ? undefined : Number(row.rating),
    favorite: Boolean(row.favorite),
    details,
    bottle: sanitizeBottle(row.bottle, details.fragranceFamily),
  };
}

export async function listShelf(): Promise<ShelfPerfume[]> {
  const rows = await getSql()`
    SELECT * FROM shelf_perfumes ORDER BY lower(brand), lower(name)`;
  return rows.map(toShelfPerfume);
}

/** Public view: only allow-listed columns, never wishlist items. */
export async function listPublicShelf(): Promise<PublicShelfPerfume[]> {
  const rows = await getSql()`
    SELECT id, name, brand, concentration, status, rating, favorite, details, bottle
    FROM shelf_perfumes
    WHERE status <> 'wishlist'
    ORDER BY lower(brand), lower(name)`;
  return rows.map(toPublicPerfume);
}

export interface NewShelfPerfume {
  name: string;
  brand: string;
  concentration: string;
  status: ShelfStatus;
  sizeMl: number | null;
  rating: number | null;
  favorite: boolean;
  privateNotes: string;
  details: ShelfDetails;
  bottle: BottleSpec;
}

export class DuplicateShelfPerfumeError extends Error {
  constructor() {
    super("This perfume is already on your shelf.");
    this.name = "DuplicateShelfPerfumeError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { code?: string }).code === "23505");
}

export async function createShelfPerfume(input: NewShelfPerfume): Promise<ShelfPerfume> {
  try {
    const rows = await getSql()`
      INSERT INTO shelf_perfumes
        (name, brand, concentration, status, size_ml, rating, favorite, private_notes, details, bottle)
      VALUES
        (${input.name}, ${input.brand}, ${input.concentration}, ${input.status}, ${input.sizeMl},
         ${input.rating}, ${input.favorite}, ${input.privateNotes},
         ${JSON.stringify(input.details)}::jsonb, ${JSON.stringify(input.bottle)}::jsonb)
      RETURNING *`;
    return toShelfPerfume(rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateShelfPerfumeError();
    throw error;
  }
}

/** Fields that may be changed after adding. `undefined` = leave unchanged; `null` = clear. */
export interface ShelfPerfumePatch {
  status?: ShelfStatus;
  sizeMl?: number | null;
  rating?: number | null;
  favorite?: boolean;
  privateNotes?: string;
  bottle?: BottleSpec;
}

export async function updateShelfPerfume(id: string, patch: ShelfPerfumePatch): Promise<ShelfPerfume | null> {
  const has = (key: keyof ShelfPerfumePatch) => patch[key] !== undefined;
  const rows = await getSql()`
    UPDATE shelf_perfumes SET
      status        = CASE WHEN ${has("status")}       THEN ${patch.status ?? null}       ELSE status END,
      size_ml       = CASE WHEN ${has("sizeMl")}       THEN ${patch.sizeMl ?? null}::numeric ELSE size_ml END,
      rating        = CASE WHEN ${has("rating")}       THEN ${patch.rating ?? null}::smallint ELSE rating END,
      favorite      = CASE WHEN ${has("favorite")}     THEN ${patch.favorite ?? false}    ELSE favorite END,
      private_notes = CASE WHEN ${has("privateNotes")} THEN ${patch.privateNotes ?? ""}   ELSE private_notes END,
      bottle        = CASE WHEN ${has("bottle")}       THEN ${JSON.stringify(patch.bottle ?? {})}::jsonb ELSE bottle END,
      updated_at    = now()
    WHERE id = ${id}
    RETURNING *`;
  return rows[0] ? toShelfPerfume(rows[0]) : null;
}

/** Deletes the item. Returns false if it didn’t exist, otherwise its photo record (if any) for file cleanup. */
export async function deleteShelfPerfume(id: string): Promise<false | { photo: StoredPhoto | null }> {
  const rows = await getSql()`DELETE FROM shelf_perfumes WHERE id = ${id} RETURNING photo`;
  if (rows.length === 0) return false;
  return { photo: (rows[0].photo as StoredPhoto | null) ?? null };
}

// ---------------------------------------------------------------------------
// Photos (private shelf only — never part of the public query)
// ---------------------------------------------------------------------------

export async function getShelfPerfume(id: string): Promise<ShelfPerfume | null> {
  const rows = await getSql()`SELECT * FROM shelf_perfumes WHERE id = ${id}`;
  return rows[0] ? toShelfPerfume(rows[0]) : null;
}

/** Internal photo record (storage paths are never sent to the browser). */
export async function getStoredPhoto(id: string): Promise<StoredPhoto | null> {
  const rows = await getSql()`SELECT photo FROM shelf_perfumes WHERE id = ${id}`;
  return (rows[0]?.photo as StoredPhoto | null) ?? null;
}

/** Sets (or clears) the photo record. Returns the updated item and the previous record for file cleanup. */
export async function setShelfPhoto(
  id: string,
  photo: StoredPhoto | null
): Promise<{ item: ShelfPerfume; previous: StoredPhoto | null } | null> {
  const rows = await getSql()`
    WITH old AS (SELECT photo FROM shelf_perfumes WHERE id = ${id})
    UPDATE shelf_perfumes SET
      photo = ${photo ? JSON.stringify(photo) : null}::jsonb,
      updated_at = now()
    WHERE id = ${id}
    RETURNING *, (SELECT photo FROM old) AS previous_photo`;
  if (!rows[0]) return null;
  return { item: toShelfPerfume(rows[0]), previous: (rows[0].previous_photo as StoredPhoto | null) ?? null };
}
