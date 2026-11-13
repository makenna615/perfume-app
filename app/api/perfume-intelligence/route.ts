import { NextRequest, NextResponse } from "next/server";
import {
  ApiResponse,
  PerfumeIntelligenceAvailability,
  PerfumeIntelligenceDetails,
  PerfumeIntelligenceResponse,
  PerfumeIntelligenceSuggestion,
} from "@/types";
import { getAIService } from "@/lib/ai/factory";
import { getPageExtractionPrompt, getPerfumeIntelligencePrompt, getWebPerfumePrompt } from "@/lib/ai/prompts";
import { AIServiceError, type WebSource } from "@/lib/ai/types";
import {
  CONFIDENCE,
  MAX_INPUT_LENGTH,
  PRICE_TIERS,
  obj,
  oneOf,
  sanitizeSources,
  str,
  strArr,
  year,
} from "@/lib/ai/sanitize";

// Lookup strategy:
// 1. Try Fragrantica for an exact title match (real, published note pyramid).
//    Several exact matches and no brand in the query → ask the user to pick.
// 2. In parallel, ask the model for the descriptive fields (description,
//    performance, seasons…), which Fragrantica pages don't expose cleanly.
// 3. Merge: Fragrantica wins for notes, accords, year and community rating.
// Ratings, prices and URLs are never taken from the model.

interface FragranticaMatch {
  name: string;
  brand: string;
  url: string;
}

interface FragranticaData {
  match: FragranticaMatch;
  notes: { top: string[]; middle: string[]; base: string[] };
  accords: string[];
  releaseYear?: number;
  perfumers: string[];
  community?: { rating: number; reviewsCount: number };
  gender?: "male" | "female" | "unisex";
}

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; PerfumeApp/1.0)",
  Accept: "text/html,application/xhtml+xml",
};

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeTitle(value: string): string {
  return normalize(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function splitPerfumeQuery(query: string): { title: string; brandHint?: string } {
  const byIndex = query.toLowerCase().indexOf(" by ");
  if (byIndex > 0) {
    return { title: query.slice(0, byIndex).trim(), brandHint: query.slice(byIndex + 4).trim() };
  }
  return { title: query.trim() };
}

function buildSearchLinks(name: string, brand: string): PerfumeIntelligenceAvailability[] {
  const q = encodeURIComponent(`${brand} ${name}`.trim());
  return [
    { store: "Fragrantica", region: "Notes, reviews & votes", url: `https://www.fragrantica.com/search/?query=${q}` },
    { store: "Sephora", region: "US retailer", url: `https://www.sephora.com/search?keyword=${q}` },
    { store: "Google Shopping", region: "Compare current prices", url: `https://www.google.com/search?tbm=shop&q=${q}` },
  ];
}

// ---------------------------------------------------------------------------
// Fragrantica
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url: string, ms: number): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(ms),
    });
    return response.ok ? await response.text() : null;
  } catch {
    return null;
  }
}

function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value).replace(/-/g, " ").trim();
  } catch {
    return value.replace(/-/g, " ").trim();
  }
}

function extractExactTitleMatches(html: string, titleQuery: string): FragranticaMatch[] {
  const target = normalizeTitle(titleQuery);
  if (!target) return [];

  const regex = /href="\/perfume\/([^/"]+)\/([^"?#]+)"/gi;
  const found = new Map<string, FragranticaMatch>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const [, brandSlug, perfumeSlugFull] = match;
    const name = decodeSlug(perfumeSlugFull.replace(/-\d+\.html?$/i, "").replace(/\.html?$/i, ""));
    const brand = decodeSlug(brandSlug);
    if (normalizeTitle(name) === target) {
      const key = `${normalizeTitle(name)}|${normalizeTitle(brand)}`;
      if (!found.has(key)) {
        found.set(key, {
          name,
          brand,
          url: `https://www.fragrantica.com/perfume/${brandSlug}/${perfumeSlugFull}`,
        });
      }
    }
  }
  return Array.from(found.values());
}

async function findFragranticaMatches(title: string): Promise<FragranticaMatch[]> {
  const q = encodeURIComponent(title.trim());
  if (!q) return [];
  const pages = await Promise.all(
    [`query=${q}`, `q=${q}`].map((param) =>
      fetchWithTimeout(`https://www.fragrantica.com/search/?${param}`, 4000)
    )
  );
  const merged = new Map<string, FragranticaMatch>();
  for (const html of pages) {
    if (!html) continue;
    for (const m of extractExactTitleMatches(html, title)) {
      merged.set(`${normalize(m.name)}|${normalize(m.brand)}`, m);
    }
  }
  return Array.from(merged.values());
}

function pickMatch(matches: FragranticaMatch[], query: string): FragranticaMatch | null {
  if (matches.length === 0) return null;
  const { brandHint } = splitPerfumeQuery(query);
  const q = normalize(query);
  const hint = brandHint ? normalize(brandHint) : null;
  return (
    (hint &&
      matches.find((m) => normalize(m.brand).includes(hint) || hint.includes(normalize(m.brand)))) ||
    matches.find((m) => q.includes(normalize(m.brand))) ||
    (matches.length === 1 ? matches[0] : null)
  );
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractContextWindows(html: string, terms: string[], radius = 5000): string {
  const lower = html.toLowerCase();
  const chunks: Array<[number, number]> = [];
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx >= 0) chunks.push([Math.max(0, idx - radius), Math.min(html.length, idx + radius)]);
  }
  if (chunks.length === 0) return html.slice(0, 20000);
  // Merge overlapping windows, then strip scripts/styles to save tokens.
  chunks.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && chunk[0] <= last[1]) last[1] = Math.max(last[1], chunk[1]);
    else merged.push([...chunk]);
  }
  return merged
    .map(([s, e]) => html.slice(s, e))
    .join("\n<!-- … -->\n")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .slice(0, 40000);
}

function extractCommunity(html: string): { rating: number; reviewsCount: number } | undefined {
  const rating = html.match(/"ratingValue"\s*:\s*"?([0-5](?:\.\d+)?)"?/i)?.[1];
  const count = html.match(/"(?:ratingCount|reviewCount)"\s*:\s*"?([0-9][0-9,]*)"?/i)?.[1];
  if (rating && count) {
    const r = Number(rating);
    const c = Number(count.replace(/,/g, ""));
    if (Number.isFinite(r) && Number.isFinite(c) && c > 0) return { rating: r, reviewsCount: c };
  }
  return undefined;
}

function extractNotesNearLabel(html: string, label: string): string[] {
  const index = html.toLowerCase().indexOf(label.toLowerCase());
  if (index < 0) return [];
  const chunk = html.slice(index, index + 4000);
  const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
  const notes: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = anchorRegex.exec(chunk)) && notes.length < 8) {
    const candidate = stripHtml(m[1]);
    if (candidate.length > 1 && candidate.length < 40 && !/fragrantica|perfume|parfum|home|search/i.test(candidate)) {
      notes.push(candidate);
    }
  }
  return Array.from(new Set(notes)).slice(0, 6);
}

async function fetchFragranticaData(match: FragranticaMatch): Promise<FragranticaData | null> {
  const html = await fetchWithTimeout(match.url, 6000);
  if (!html) return null;

  const description = stripHtml(html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ?? "");
  const snippet = extractContextWindows(html, [
    "top notes",
    "middle notes",
    "heart notes",
    "base notes",
    "main accords",
    "perfumer",
  ]);

  let extracted: Record<string, unknown> = {};
  try {
    extracted = await getAIService().generateJSON({
      task: "page-extraction",
      ...getPageExtractionPrompt(snippet, match.name, match.brand),
    });
  } catch {
    // fall through to regex extraction
  }

  let notes = {
    top: strArr(extracted.top, 8),
    middle: strArr(extracted.middle, 8),
    base: strArr(extracted.base, 8),
  };
  if (notes.top.length + notes.middle.length + notes.base.length === 0) {
    notes = {
      top: extractNotesNearLabel(html, "Top Notes"),
      middle: extractNotesNearLabel(html, "Middle Notes").length
        ? extractNotesNearLabel(html, "Middle Notes")
        : extractNotesNearLabel(html, "Heart Notes"),
      base: extractNotesNearLabel(html, "Base Notes"),
    };
  }
  if (notes.top.length + notes.middle.length + notes.base.length === 0) return null;

  const launched = stripHtml(html).match(/launched in\s+((?:19|20)\d{2})/i)?.[1];

  return {
    match,
    notes,
    accords: strArr(extracted.accords, 6).map((a) => a.toLowerCase()),
    releaseYear: year(extracted.releaseYear) ?? year(launched),
    perfumers: strArr(extracted.perfumers, 4),
    community: extractCommunity(html),
    gender: /for women and men|for men and women/i.test(description)
      ? "unisex"
      : /for men/i.test(description)
        ? "male"
        : /for women/i.test(description)
          ? "female"
          : undefined,
  };
}

// ---------------------------------------------------------------------------
// Model output
// ---------------------------------------------------------------------------

const LONGEVITY = ["poor", "moderate", "long-lasting", "very long-lasting"] as const;
const SILLAGE = ["soft", "moderate", "strong", "enormous"] as const;
const STRENGTH = ["dominant", "prominent", "subtle"] as const;
const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

function sanitizeSuggestions(value: unknown, fallbackReason: string): PerfumeIntelligenceSuggestion[] {
  return (Array.isArray(value) ? value : [])
    .map(obj)
    .filter((item): item is Record<string, unknown> => Boolean(item && str(item.name) && str(item.brand)))
    // Drop placeholder brands the model sometimes emits instead of admitting it does not know.
    .filter((item) => !/^(n\/?a|none|null|unknown|various|-)$/i.test(str(item.brand) ?? ""))
    .slice(0, 6)
    .map((item) => ({
      name: str(item.name, 120)!,
      brand: str(item.brand, 120)!,
      reason: str(item.reason, 240) ?? fallbackReason,
    }));
}

function sanitizeModelResponse(
  raw: Record<string, unknown>,
  source: "ai" | "web" = "ai",
  sources: WebSource[] = []
): PerfumeIntelligenceResponse {
  const confidence = oneOf(raw.confidence, CONFIDENCE) ?? "low";
  const p = obj(raw.perfume);
  const notesRaw = obj(p?.notes);
  const performance = obj(p?.performance);

  const notes = {
    top: strArr(notesRaw?.top, 10),
    middle: strArr(notesRaw?.middle, 16), // linear (flat) note lists live here
    base: strArr(notesRaw?.base, 10),
  };
  const hasNotes = notes.top.length + notes.middle.length + notes.base.length > 0;

  const alternatives = sanitizeSuggestions(raw.sameNameAlternatives, "Shares this name.");
  const suggestions = sanitizeSuggestions(raw.suggestions, "A close match to your search.");

  // Low confidence is never presented as a found result.
  if (raw.found !== true || confidence === "low" || !p || !str(p.name) || !hasNotes) {
    return { found: false, confidence: "low", ambiguous: false, perfume: null, alternatives: [], suggestions };
  }

  const name = str(p.name, 120)!;
  const brand = str(p.brand, 120) ?? "";
  const longevity = oneOf(performance?.longevity, LONGEVITY);
  const sillage = oneOf(performance?.sillage, SILLAGE);

  const perfume: PerfumeIntelligenceDetails = {
    name,
    brand,
    concentration: str(p.concentration, 40),
    // Only trust the year when the model is highly confident about the perfume.
    releaseYear: confidence === "high" ? year(p.releaseYear) : undefined,
    perfumers: strArr(p.perfumers, 4),
    gender: oneOf(p.gender, ["male", "female", "unisex"] as const),
    fragranceFamily: str(p.fragranceFamily, 60),
    accords: (Array.isArray(p.accords) ? p.accords : [])
      .map(obj)
      .filter((a): a is Record<string, unknown> => Boolean(a && str(a.name)))
      .slice(0, 6)
      .map((a) => ({ name: str(a.name, 40)!.toLowerCase(), strength: oneOf(a.strength, STRENGTH) ?? "subtle" })),
    description: str(p.description, 800) ?? "",
    notesStructure: p.notesStructure === "linear" ? "linear" : "pyramid",
    notes,
    performance: longevity && sillage ? { longevity, sillage } : undefined,
    seasons: strArr(p.seasons, 4).map((s) => s.toLowerCase()).filter((s) => (SEASONS as readonly string[]).includes(s)),
    occasions: strArr(p.occasions, 5, 30),
    priceTier: oneOf(p.priceTier, PRICE_TIERS),
    availability: buildSearchLinks(name, brand),
    source,
    ...(source === "web" ? { sources: sanitizeSources(sources) } : {}),
  };

  return { found: true, confidence, ambiguous: false, perfume, alternatives, suggestions: [] };
}

function mergeWithFragrantica(
  base: PerfumeIntelligenceResponse,
  frag: FragranticaData
): PerfumeIntelligenceResponse {
  const ai = base.found ? base.perfume : null;
  const fragAccords = frag.accords.map((name, index) => ({
    name,
    strength: (index === 0 ? "dominant" : index < 3 ? "prominent" : "subtle") as
      | "dominant"
      | "prominent"
      | "subtle",
  }));
  const notesStructure =
    frag.notes.top.length === 0 && frag.notes.base.length === 0 ? "linear" : "pyramid";

  return {
    found: true,
    confidence: "high",
    ambiguous: false,
    alternatives: base.alternatives,
    suggestions: [],
    perfume: {
      name: frag.match.name.replace(/\b\w/g, (c) => c.toUpperCase()),
      brand: frag.match.brand.replace(/\b\w/g, (c) => c.toUpperCase()),
      concentration: ai?.concentration,
      releaseYear: frag.releaseYear ?? ai?.releaseYear,
      perfumers: frag.perfumers.length ? frag.perfumers : ai?.perfumers ?? [],
      gender: frag.gender ?? ai?.gender,
      fragranceFamily: ai?.fragranceFamily ?? frag.accords[0],
      accords: fragAccords.length ? fragAccords : ai?.accords ?? [],
      description: ai?.description ?? "",
      notesStructure,
      notes: frag.notes,
      performance: ai?.performance,
      seasons: ai?.seasons ?? [],
      occasions: ai?.occasions ?? [],
      priceTier: ai?.priceTier,
      availability: buildSearchLinks(frag.match.name, frag.match.brand),
      community: frag.community,
      source: "fragrantica",
      sourceUrl: frag.match.url,
    },
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Web search fallback
// ---------------------------------------------------------------------------

/** Does the brand in the result plausibly match the brand the user typed? */
function brandMatches(hint: string, brand: string): boolean {
  const a = normalizeTitle(hint);
  const b = normalizeTitle(brand);
  if (!a || !b || a.includes(b) || b.includes(a)) return true;
  // Initials: "MFK" → Maison Francis Kurkdjian, "YSL" → Yves Saint Laurent.
  const initials = b.split(" ").filter(Boolean).map((t) => t[0]).join("");
  if (initials.length >= 2 && a.replace(/\s/g, "") === initials) return true;
  // Shared distinctive word, tolerant of small misspellings ("Gillies" ~ "Gillie").
  const words = (s: string) => s.split(" ").filter((t) => t.length >= 4);
  return words(a).some((x) => words(b).some((y) => x.startsWith(y.slice(0, 5)) || y.startsWith(x.slice(0, 5))));
}

async function webLookup(query: string, brandHint?: string): Promise<PerfumeIntelligenceResponse | null> {
  try {
    const { data, sources } = await getAIService().searchWebJSON({
      task: "web-perfume",
      ...getWebPerfumePrompt(query),
    });
    const result = sanitizeModelResponse(data, "web", sources);
    if (result.perfume && brandHint && !brandMatches(brandHint, result.perfume.brand)) {
      return { ...result, found: false, perfume: null, alternatives: [] };
    }
    return result;
  } catch (error) {
    // A failed web search must never break the lookup — fall back to "not found".
    console.warn("Web perfume lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { perfumeName?: unknown };
    const perfumeName =
      typeof body.perfumeName === "string" ? body.perfumeName.trim().slice(0, MAX_INPUT_LENGTH) : "";

    if (!perfumeName) {
      return NextResponse.json(
        { success: false, error: "perfumeName is required." } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { title, brandHint } = splitPerfumeQuery(perfumeName);
    const matches = await findFragranticaMatches(title || perfumeName);
    const selected = pickMatch(matches, perfumeName);

    // Real, verified name collision and nothing to disambiguate with → ask.
    if (!selected && matches.length > 1 && !brandHint) {
      return NextResponse.json({
        success: true,
        data: {
          found: false,
          confidence: "low",
          ambiguous: true,
          perfume: null,
          alternatives: [],
          suggestions: matches.slice(0, 8).map((m) => ({
            name: m.name.replace(/\b\w/g, (c) => c.toUpperCase()),
            brand: m.brand.replace(/\b\w/g, (c) => c.toUpperCase()),
            reason: "Listed on Fragrantica with this exact name.",
          })),
        },
      } as ApiResponse<PerfumeIntelligenceResponse>);
    }

    const modelQuery = selected ? `${selected.name} by ${selected.brand}` : perfumeName;
    const [modelRaw, fragData] = await Promise.all([
      getAIService().generateJSON({ task: "perfume-details", ...getPerfumeIntelligencePrompt(modelQuery) }),
      selected ? fetchFragranticaData(selected) : Promise.resolve(null),
    ]);

    let result = sanitizeModelResponse(modelRaw);
    if (fragData) {
      result = mergeWithFragrantica(result, fragData);
    }

    // The model answered about a different brand than the user named (e.g. "Red by Sora Dora"
    // → "Red by Giorgio Beverly Hills"). That's the wrong perfume: treat it as not found.
    if (!fragData && result.perfume && brandHint && !brandMatches(brandHint, result.perfume.brand)) {
      result = { ...result, found: false, perfume: null, alternatives: [] };
    }

    // Niche / indie perfumes the model doesn't know: search the web. Slower and costlier,
    // so it only runs when the faster sources came up empty.
    if (!result.found) {
      const web = await webLookup(perfumeName, brandHint);
      if (web?.found) {
        result = web;
      } else if (web && result.suggestions.length === 0) {
        result = { ...result, suggestions: web.suggestions };
      }
    }

    // Drop "alternatives" that are just the found perfume itself.
    if (result.perfume) {
      const self = `${normalize(result.perfume.name)}|${normalize(result.perfume.brand)}`;
      result.alternatives = result.alternatives.filter(
        (alt) => `${normalize(alt.name)}|${normalize(alt.brand)}` !== self
      );
    }

    return NextResponse.json({ success: true, data: result } as ApiResponse<PerfumeIntelligenceResponse>);
  } catch (error) {
    console.error("Perfume intelligence error:", error);
    const status = error instanceof AIServiceError ? error.status : 500;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof AIServiceError ? error.message : "Failed to fetch perfume details.",
      } as ApiResponse<null>,
      { status }
    );
  }
}
