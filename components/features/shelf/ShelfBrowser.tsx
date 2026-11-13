"use client";

import { useMemo, useState } from "react";
import type { ShelfStatus } from "@/types";
import { ShelfDisplay, ShelfGrid, type DisplayItem, type GroupBy } from "@/components/features/shelf/ShelfViews";
import { STATUS_LABEL } from "@/lib/shelf/model";

type View = "shelf" | "grid";
type Sort = "brand" | "name" | "rating";

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
    active ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink hover:text-ink"
  }`;

export default function ShelfBrowser<T extends DisplayItem>({
  items,
  onSelect,
  statuses,
}: {
  items: T[];
  onSelect: (item: T) => void;
  /** Status filters to offer (the public page omits wishlist). */
  statuses: ShelfStatus[];
}) {
  const [view, setView] = useState<View>("shelf");
  const [groupBy, setGroupBy] = useState<GroupBy>("family");
  const [sort, setSort] = useState<Sort>("brand");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ShelfStatus | "all">("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!q) return true;
      const haystack = [
        item.name,
        item.brand,
        item.details.fragranceFamily,
        ...item.details.notes.top,
        ...item.details.notes.middle,
        ...item.details.notes.base,
        ...item.details.accords.map((a) => a.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    if (view === "shelf") return filtered;
    return [...filtered].sort((a, b) =>
      sort === "rating"
        ? (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name)
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)
    );
  }, [items, query, status, sort, view]);

  const counts = useMemo(() => {
    const c = new Map<ShelfStatus, number>();
    items.forEach((i) => c.set(i.status, (c.get(i.status) ?? 0) + 1));
    return c;
  }, [items]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="View" className="mr-2 flex gap-1">
            {(["shelf", "grid"] as const).map((v) => (
              <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)} className={pill(view === v)}>
                {v === "shelf" ? "Shelf" : "Grid"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            {view === "shelf" ? "Group by" : "Sort by"}
            {view === "shelf" ? (
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="rounded-sm border border-line bg-card px-2 py-1 text-sm text-ink">
                <option value="family">Scent family</option>
                <option value="brand">Brand</option>
                <option value="status">Status</option>
                <option value="none">Nothing</option>
              </select>
            ) : (
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-sm border border-line bg-card px-2 py-1 text-sm text-ink">
                <option value="brand">Brand</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            )}
          </label>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, brand or note…"
          aria-label="Search the shelf"
          className="w-full rounded-full border border-line bg-card px-4 py-1.5 text-sm lg:w-72"
        />
      </div>

      {statuses.length > 1 && (
        <div className="-mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Filter by status">
          <button role="radio" aria-checked={status === "all"} onClick={() => setStatus("all")} className={pill(status === "all")}>
            All <span className="opacity-60">{items.length}</span>
          </button>
          {statuses
            .filter((s) => counts.get(s))
            .map((s) => (
              <button key={s} role="radio" aria-checked={status === s} onClick={() => setStatus(s)} className={pill(status === s)}>
                {STATUS_LABEL[s]} <span className="opacity-60">{counts.get(s)}</span>
              </button>
            ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-10 text-center font-display text-2xl italic text-ink-soft">Nothing matches that search.</p>
      ) : view === "shelf" ? (
        <ShelfDisplay items={visible} groupBy={groupBy} onSelect={onSelect} />
      ) : (
        <ShelfGrid items={visible} onSelect={onSelect} />
      )}
    </div>
  );
}
