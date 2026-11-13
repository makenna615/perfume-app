-- Perfume shelf: one row per perfume in the owner's collection (or wishlist).
CREATE TABLE IF NOT EXISTS shelf_perfumes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  brand         text NOT NULL DEFAULT '' CHECK (char_length(brand) <= 120),
  concentration text NOT NULL DEFAULT '' CHECK (char_length(concentration) <= 40),
  status        text NOT NULL DEFAULT 'full'
                CHECK (status IN ('full', 'decant', 'sample', 'wishlist', 'finished')),
  size_ml       numeric(6, 1) CHECK (size_ml IS NULL OR (size_ml > 0 AND size_ml <= 5000)),
  rating        smallint CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  favorite      boolean NOT NULL DEFAULT false,
  private_notes text NOT NULL DEFAULT '' CHECK (char_length(private_notes) <= 2000),
  -- Snapshot of the perfume breakdown at the time it was added (no AI calls when browsing).
  details       jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Bottle illustration spec (shape, colours, cap).
  bottle        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- The same perfume (name + brand + concentration) can only be on the shelf once.
CREATE UNIQUE INDEX IF NOT EXISTS shelf_perfumes_identity
  ON shelf_perfumes (lower(name), lower(brand), lower(concentration));

CREATE INDEX IF NOT EXISTS shelf_perfumes_status ON shelf_perfumes (status);
