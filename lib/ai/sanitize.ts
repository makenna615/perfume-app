// Defensive readers for model output. The model is asked for a strict schema, but
// every field is still validated before it reaches the UI.

export type Obj = Record<string, unknown>;

export function obj(value: unknown): Obj | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : null;
}

export function str(value: unknown, max = 600): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function strArr(value: unknown, maxItems = 12, maxLen = 80): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    const s = str(item, maxLen);
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
    if (out.length >= maxItems) break;
  }
  return out;
}

export function num(value: unknown, min = -Infinity, max = Infinity): number | undefined {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}

export function oneOf<T extends string>(value: unknown, options: readonly T[]): T | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === normalized);
}

export function year(value: unknown): number | undefined {
  const y = num(value, 1880, new Date().getFullYear() + 1);
  return y ? Math.round(y) : undefined;
}

export function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const NOTE_ROLES = ["top", "middle", "base"] as const;
export const COST_TIERS = ["low", "medium", "high", "very-high"] as const;
export const PRICE_TIERS = ["budget", "designer", "niche", "luxury"] as const;
export const CONFIDENCE = ["high", "medium", "low"] as const;

/** Accepts "heart" and "top-middle"-style values and maps them onto the three roles. */
export function noteRole(value: unknown): (typeof NOTE_ROLES)[number] | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.toLowerCase();
  if (v.startsWith("top")) return "top";
  if (v.startsWith("middle") || v.startsWith("heart")) return "middle";
  if (v.startsWith("base")) return "base";
  return undefined;
}

/** Hard cap on free-text user input sent to the model. */
export const MAX_INPUT_LENGTH = 400;

/** Keeps only well-formed http(s) links (max 5) — blocks javascript:, data: and other schemes. */
export function sanitizeSources(value: unknown): Array<{ url: string; title?: string }> {
  if (!Array.isArray(value)) return [];
  const out: Array<{ url: string; title?: string }> = [];
  const seen = new Set<string>();
  for (const item of value) {
    const o = obj(item);
    const raw = str(o?.url, 500);
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if ((url.protocol !== "https:" && url.protocol !== "http:") || seen.has(url.href)) continue;
      seen.add(url.href);
      const title = str(o?.title, 120);
      out.push(title ? { url: url.href, title } : { url: url.href });
    } catch {
      continue;
    }
    if (out.length >= 5) break;
  }
  return out;
}
