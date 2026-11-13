-- Bottle photo stored privately in Vercel Blob (served only through an authenticated route).
-- Shape: { "pathname": string, "origin": "brand" | "upload", "sourceUrl"?: string,
--          "width": number, "height": number, "updatedAt": string }
-- Never selected by the public collection query.
ALTER TABLE shelf_perfumes ADD COLUMN IF NOT EXISTS photo jsonb;
