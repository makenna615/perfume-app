"use client";

import Link from "next/link";
import { useState } from "react";
import type { PerfumeIntelligenceDetails, ShelfStatus } from "@/types";
import Button from "@/components/ui/Button";
import { addToShelf, findPhotoAndRender, useShelf } from "@/lib/hooks/useShelf";
import { SHELF_STATUSES, STATUS_LABEL, detailsFromLookup } from "@/lib/shelf/model";

/** "Add to shelf" for a looked-up perfume; shows "On your shelf" if already added. */
export default function AddToShelfButton({ perfume }: { perfume: PerfumeIntelligenceDetails }) {
  const { has, loading } = useShelf();
  const [status, setStatus] = useState<ShelfStatus>("full");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (has(perfume.name, perfume.brand)) {
    return (
      <Link href="/shelf" className="inline-flex items-center gap-2 text-sm text-moss">
        ✓ On your shelf <span className="link text-ink-soft">View shelf</span>
      </Link>
    );
  }

  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await addToShelf({
        name: perfume.name,
        brand: perfume.brand,
        concentration: perfume.concentration ?? "",
        status,
        details: detailsFromLookup(perfume),
      });
      void findPhotoAndRender(created.id); // background
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this perfume.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ShelfStatus)}
          aria-label="Add as"
          className="rounded-sm border border-line bg-card px-2 py-1.5 text-sm"
        >
          {SHELF_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <Button size="sm" variant="secondary" onClick={add} isLoading={busy}>
          {busy ? "Adding…" : "Add to shelf"}
        </Button>
      </div>
      {error && <span className="text-xs text-alert">{error}</span>}
    </div>
  );
}
