// Shared (client + server) shelf constants and validators. No secrets or DB access here.
import type {
  BottleShape,
  BottleSpec,
  CapShape,
  PerfumeIntelligenceDetails,
  ShelfDetails,
  ShelfStatus,
} from "@/types";
import { num, obj, oneOf, sanitizeSources, str, strArr, year } from "@/lib/ai/sanitize";

export const SHELF_STATUSES: readonly ShelfStatus[] = ["full", "decant", "sample", "wishlist", "finished"];
export const STATUS_LABEL: Record<ShelfStatus, string> = {
  full: "Full bottle",
  decant: "Decant",
  sample: "Sample",
  wishlist: "Wishlist",
  finished: "Finished",
};

export const BOTTLE_SHAPES: readonly BottleShape[] = [
  "rectangle",
  "square",
  "round",
  "cylinder",
  "oval",
  "faceted",
  "flask",
  "tall",
];
export const CAP_SHAPES: readonly CapShape[] = ["cube", "cylinder", "dome", "tall", "sphere", "faceted", "flat"];
const GLASS_FINISHES = ["clear", "frosted", "tinted", "opaque"] as const;
const CAP_FINISHES = ["metallic", "matte", "glossy"] as const;
const ACCURACY = ["known", "approximate", "generic"] as const;
const STRENGTHS = ["dominant", "prominent", "subtle"] as const;

export const LIMITS = { name: 120, brand: 120, concentration: 40, privateNotes: 2000, bulkLines: 150 } as const;

function hex(value: unknown): string | undefined {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toLowerCase() : undefined;
}

/** Liquid colour suggested by the fragrance family, used when nothing better is known. */
export function familyColor(family?: string): string {
  const f = (family ?? "").toLowerCase();
  const table: Array<[RegExp, string]> = [
    [/gourmand|vanilla|caramel/, "#c08552"],
    [/amber|oriental|resin/, "#c98b3a"],
    [/leather|tobacco/, "#7a4b2f"],
    [/wood|oud|santal|cedar/, "#a06a3c"],
    [/spic/, "#c4602f"],
    [/citrus|hesperid/, "#f0d36a"],
    [/aquatic|marine|ozonic|fresh/, "#bfe0ea"],
    [/green|fougère|fougere|aromatic|herbal/, "#b7cc8c"],
    [/chypre|moss/, "#a99a55"],
    [/fruit/, "#f2a97f"],
    [/rose|floral|flower/, "#efc3cc"],
    [/musk|powder|iris|aldehyd/, "#efe4d8"],
  ];
  return table.find(([re]) => re.test(f))?.[1] ?? "#e8d3a8";
}

export function defaultBottle(family?: string): BottleSpec {
  return {
    shape: "rectangle",
    glassFinish: "clear",
    glassColor: "#f4f1ea",
    liquidColor: familyColor(family),
    cap: { shape: "cube", color: "#2a2622", finish: "glossy" },
    accuracy: "generic",
  };
}

export function sanitizeBottle(raw: unknown, family?: string): BottleSpec {
  const fallback = defaultBottle(family);
  const b = obj(raw);
  if (!b) return fallback;
  const cap = obj(b.cap);
  const label = hex(b.labelColor);
  return {
    shape: oneOf(b.shape, BOTTLE_SHAPES) ?? fallback.shape,
    glassFinish: oneOf(b.glassFinish, GLASS_FINISHES) ?? fallback.glassFinish,
    glassColor: hex(b.glassColor) ?? fallback.glassColor,
    liquidColor: hex(b.liquidColor) ?? fallback.liquidColor,
    cap: {
      shape: oneOf(cap?.shape, CAP_SHAPES) ?? fallback.cap.shape,
      color: hex(cap?.color) ?? fallback.cap.color,
      finish: oneOf(cap?.finish, CAP_FINISHES) ?? fallback.cap.finish,
    },
    ...(label ? { labelColor: label } : {}),
    accuracy: oneOf(b.accuracy, ACCURACY) ?? "approximate",
  };
}

export function sanitizeDetails(raw: unknown): ShelfDetails {
  const d = obj(raw) ?? {};
  const notes = obj(d.notes);
  return {
    releaseYear: year(d.releaseYear),
    perfumers: strArr(d.perfumers, 4),
    fragranceFamily: str(d.fragranceFamily, 60),
    accords: (Array.isArray(d.accords) ? d.accords : [])
      .map(obj)
      .filter((a): a is Record<string, unknown> => Boolean(a && str(a.name)))
      .slice(0, 6)
      .map((a) => ({ name: str(a.name, 40)!.toLowerCase(), strength: oneOf(a.strength, STRENGTHS) ?? "subtle" })),
    notesStructure: d.notesStructure === "linear" ? "linear" : "pyramid",
    notes: {
      top: strArr(notes?.top, 10),
      middle: strArr(notes?.middle, 12),
      base: strArr(notes?.base, 10),
    },
    description: str(d.description, 800),
    source: oneOf(d.source, ["fragrantica", "ai", "web", "manual"] as const),
    sources: sanitizeSources(d.sources),
  };
}

/** Turn a perfume lookup result into the snapshot stored on the shelf. */
export function detailsFromLookup(p: PerfumeIntelligenceDetails): ShelfDetails {
  return {
    releaseYear: p.releaseYear,
    perfumers: p.perfumers,
    fragranceFamily: p.fragranceFamily,
    accords: p.accords,
    notesStructure: p.notesStructure,
    notes: p.notes,
    description: p.description,
    source: p.source,
    sources: p.sources,
  };
}

export function shelfKey(name: string, brand: string): string {
  const norm = (v: string) =>
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return `${norm(name)}|${norm(brand)}`;
}

export function parseRating(value: unknown): number | null | undefined {
  if (value === null) return null;
  const n = num(value, 1, 5);
  return n === undefined ? undefined : Math.round(n);
}
