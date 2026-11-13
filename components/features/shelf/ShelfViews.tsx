"use client";

import type { ShelfPerfume, ShelfStatus } from "@/types";
import BottleDisplay from "@/components/features/shelf/BottleDisplay";
import { STATUS_LABEL } from "@/lib/shelf/model";

/** Fields both the private shelf and the public collection provide. */
export type DisplayItem = Pick<
  ShelfPerfume,
  "id" | "name" | "brand" | "concentration" | "rating" | "favorite" | "details" | "bottle" | "photo"
> & { status: ShelfStatus };

export type GroupBy = "family" | "brand" | "status" | "none";

const FAMILY_GROUPS: Array<[RegExp, string]> = [
  [/gourmand/, "Gourmand"],
  [/leather|tobacco/, "Leather & Tobacco"],
  [/chypre/, "Chypre"],
  [/foug[eè]re|aromatic/, "Aromatic & Fougère"],
  [/aquatic|marine|ozonic/, "Aquatic"],
  [/citrus|hesperid|fresh|green/, "Fresh, Citrus & Green"],
  [/amber|oriental|resin|balsam/, "Amber"],
  [/wood|oud|santal|cedar|vetiver/, "Woody"],
  [/floral|rose|flower|musk|powder|iris/, "Floral & Musky"],
  [/spic/, "Spicy"],
];

export function broadFamily(family?: string): string {
  const f = (family ?? "").toLowerCase();
  return FAMILY_GROUPS.find(([re]) => re.test(f))?.[1] ?? "Other";
}

const STATUS_ORDER: ShelfStatus[] = ["full", "decant", "sample", "finished", "wishlist"];

export function groupItems<T extends DisplayItem>(items: T[], by: GroupBy): Array<{ label: string; items: T[] }> {
  if (by === "none") return [{ label: "", items }];
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const label =
      by === "brand" ? item.brand || "Unknown brand" : by === "status" ? STATUS_LABEL[item.status] : broadFamily(item.details.fragranceFamily);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  const entries = Array.from(groups, ([label, list]) => ({ label, items: list }));
  if (by === "status") {
    const order = STATUS_ORDER.map((s) => STATUS_LABEL[s]);
    return entries.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  }
  return entries.sort((a, b) => (a.label === "Other" ? 1 : b.label === "Other" ? -1 : a.label.localeCompare(b.label)));
}

export function Stars({ rating, className = "" }: { rating?: number; className?: string }) {
  if (!rating) return null;
  return (
    <span className={`tracking-tight text-resin ${className}`} aria-label={`Rated ${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-line-strong">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

// Each shelf "line" is exactly ROW px tall; a repeating gradient draws a plank at the bottom
// of every line, so wrapped rows always sit on their own plank.
const ROW = 206; // niche (150) + glossy floor (26) + plank (12) + headroom
const PLANK = 12;
const plankStyle: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(to bottom,
    transparent 0, transparent ${ROW - PLANK}px,
    #b98f63 ${ROW - PLANK}px, #a57b52 ${ROW - PLANK + 3}px, #8a6340 ${ROW}px)`,
};

export function ShelfDisplay<T extends DisplayItem>({
  items,
  groupBy,
  onSelect,
}: {
  items: T[];
  groupBy: GroupBy;
  onSelect: (item: T) => void;
}) {
  return (
    <div className="space-y-12">
      {groupItems(items, groupBy).map((group) => (
        <section key={group.label || "all"} aria-label={group.label || "Shelf"}>
          {group.label && (
            <h3 className="mb-3 flex items-baseline gap-3 text-2xl">
              {group.label}
              <span className="font-sans text-sm text-ink-faint">{group.items.length}</span>
            </h3>
          )}
          <ul className="flex flex-wrap rounded-sm border border-line bg-card/60 px-3 shadow-[inset_0_1px_8px_rgba(0,0,0,0.04)]" style={plankStyle}>
            {group.items.map((item) => (
              <li key={item.id} className="group relative flex items-end justify-center" style={{ height: ROW, width: 100, paddingBottom: PLANK }}>
                <button
                  onClick={() => onSelect(item)}
                  className="flex h-full w-full cursor-pointer items-end justify-center"
                  aria-label={`${item.name} by ${item.brand}`}
                >
                  <BottleDisplay bottle={item.bottle} status={item.status} photo={item.photo} label={`${item.name} by ${item.brand}`} />
                </button>
                <span className="pointer-events-none absolute -top-1 left-1/2 z-10 w-max max-w-40 -translate-x-1/2 rounded-sm bg-ink px-2 py-1 text-center text-xs leading-tight text-paper opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {item.name}
                  <span className="block text-[11px] text-paper/70">{item.brand}</span>
                </span>
                {item.favorite && (
                  <span className="absolute right-3 top-6 z-20 text-sm text-heart" aria-label="Favorite">
                    ♥
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ShelfGrid<T extends DisplayItem>({
  items,
  onSelect,
  showStatus = true,
}: {
  items: T[];
  onSelect: (item: T) => void;
  showStatus?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 overflow-hidden rounded-sm border-l border-t border-line sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="border-b border-r border-line bg-card">
          <button onClick={() => onSelect(item)} className="group flex h-full w-full cursor-pointer flex-col items-center p-5 text-center">
            <BottleDisplay bottle={item.bottle} status={item.status} photo={item.photo} size="card" label={`${item.name} by ${item.brand}`} />
            <span className="mt-3 font-display text-xl leading-tight group-hover:text-resin">
              {item.name}
              {item.favorite && <span className="ml-1 text-sm text-heart">♥</span>}
            </span>
            <span className="text-sm text-ink-soft">{item.brand}</span>
            <span className="mt-1 text-xs text-ink-faint">
              {[item.details.fragranceFamily, showStatus && item.status !== "full" ? STATUS_LABEL[item.status] : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <Stars rating={item.rating} className="mt-1 text-sm" />
          </button>
        </li>
      ))}
    </ul>
  );
}
