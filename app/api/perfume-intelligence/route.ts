import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, PerfumeIntelligenceResponse } from "@/types";
import { getPerfumeIntelligencePrompt } from "@/lib/ai/prompts";

interface PerfumeIntelligenceBody {
  perfumeName?: string;
}

interface AmbiguityOption {
  name: string;
  brand: string;
  reason: string;
}

interface AmbiguityCheckResponse {
  ambiguous: boolean;
  options: AmbiguityOption[];
}

interface FragranticaMatch {
  name: string;
  brand: string;
  url: string;
}

type ConfidenceLevel = "high" | "medium" | "low";

const SYSTEM_PROMPT =
  "You are a fragrance encyclopedia and perfume database expert (like Fragrantica). Return only valid JSON.";

function normalizeInput(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeTitleForMatch(value: string): string {
  return normalizeInput(value).replace(/[^a-z0-9\s]/g, "").trim();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function extractJsonObject(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function hasBrandHintInQuery(query: string, brand?: string): boolean {
  const normalizedQuery = normalizeInput(query);
  if (normalizedQuery.includes(" by ")) {
    return true;
  }
  if (!brand) {
    return false;
  }
  return normalizedQuery.includes(normalizeInput(brand));
}

function splitPerfumeQuery(query: string): { title: string; brandHint?: string } {
  const normalized = query.trim();
  const lower = normalized.toLowerCase();
  const byIndex = lower.indexOf(" by ");
  if (byIndex > 0) {
    return {
      title: normalized.slice(0, byIndex).trim(),
      brandHint: normalized.slice(byIndex + 4).trim(),
    };
  }
  return { title: normalized };
}

function sanitizeAmbiguityOptions(value: unknown): AmbiguityOption[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const obj = item as Record<string, unknown>;
      return {
        name: typeof obj.name === "string" ? obj.name : "",
        brand: typeof obj.brand === "string" ? obj.brand : "",
        reason:
          typeof obj.reason === "string"
            ? obj.reason
            : "Same perfume title appears under another brand.",
      };
    })
    .filter(
      (item): item is AmbiguityOption =>
        Boolean(item && item.name.trim().length > 0 && item.brand.trim().length > 0)
    );
}

function decodeSlugToWords(value: string): string {
  return decodeURIComponent(value).replace(/-/g, " ").trim();
}

function extractFragranticaMatchesFromHtml(html: string, titleQuery: string): FragranticaMatch[] {
  const target = normalizeTitleForMatch(titleQuery);
  if (!target) {
    return [];
  }

  const regex = /href="\/perfume\/([^/"]+)\/([^"?#]+)"/gi;
  const map = new Map<string, FragranticaMatch>();
  let match: RegExpExecArray | null = regex.exec(html);

  while (match) {
    const brandSlug = match[1];
    const perfumeSlugFull = match[2];
    const perfumeSlug = perfumeSlugFull.replace(/-\d+\.html?$/i, "").replace(/\.html?$/i, "");

    const brand = decodeSlugToWords(brandSlug);
    const name = decodeSlugToWords(perfumeSlug);
    const normalizedName = normalizeTitleForMatch(name);

    if (normalizedName === target) {
      const key = `${normalizedName}|${normalizeTitleForMatch(brand)}`;
      if (!map.has(key)) {
        map.set(key, {
          name,
          brand,
          url: `https://www.fragrantica.com/perfume/${brandSlug}/${perfumeSlugFull}`,
        });
      }
    }

    match = regex.exec(html);
  }

  return Array.from(map.values());
}

function mergeFragranticaMatches(...lists: FragranticaMatch[][]): FragranticaMatch[] {
  const map = new Map<string, FragranticaMatch>();
  for (const list of lists) {
    for (const match of list) {
      const key = `${normalizeInput(match.name)}|${normalizeInput(match.brand)}`;
      if (!map.has(key)) {
        map.set(key, match);
      }
    }
  }
  return Array.from(map.values());
}

async function fetchFragranticaExactTitleMatches(query: string): Promise<FragranticaMatch[]> {
  const encoded = encodeURIComponent(query.trim());
  if (!encoded) {
    return [];
  }

  const urls = [
    `https://www.fragrantica.com/search/?query=${encoded}`,
    `https://www.fragrantica.com/search/?q=${encoded}`,
    `https://www.fragrantica.com/search/?keywords=${encoded}`,
  ];

  const results: FragranticaMatch[] = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PerfumeApp/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      results.push(...extractFragranticaMatchesFromHtml(html, query));
    } catch {
      // Soft-fail and fallback to model-only ambiguity detection.
    }
  }

  return mergeFragranticaMatches(results);
}

function toAmbiguityOptions(matches: FragranticaMatch[]): AmbiguityOption[] {
  return matches.map((match) => ({
    name: match.name,
    brand: match.brand,
    reason: "Exact same fragrance title appears under multiple brands.",
  }));
}

function selectFragranticaMatchByBrandHint(matches: FragranticaMatch[], query: string): FragranticaMatch | null {
  if (matches.length === 0) {
    return null;
  }

  const { brandHint } = splitPerfumeQuery(query);
  if (brandHint) {
    const hintedBrand = normalizeInput(brandHint);
    const byMatch = matches.find((match) =>
      normalizeInput(match.brand).includes(hintedBrand) || hintedBrand.includes(normalizeInput(match.brand))
    );
    if (byMatch) {
      return byMatch;
    }
  }

  const normalizedQuery = normalizeInput(query);
  const containsBrandMatch = matches.find((match) =>
    normalizedQuery.includes(normalizeInput(match.brand))
  );
  return containsBrandMatch || matches[0];
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractQuotedList(value: string): string[] {
  const matches = value.match(/"([^"]+)"/g) || [];
  return matches.map((item) => item.replace(/"/g, "").trim()).filter(Boolean);
}

function extractContextWindows(html: string, terms: string[], radius = 7000): string {
  const lower = html.toLowerCase();
  const chunks: string[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    let idx = lower.indexOf(term.toLowerCase());
    while (idx >= 0) {
      const start = Math.max(0, idx - radius);
      const end = Math.min(html.length, idx + radius);
      const chunk = html.slice(start, end);
      const key = `${start}-${end}`;
      if (!seen.has(key)) {
        chunks.push(chunk);
        seen.add(key);
      }
      idx = lower.indexOf(term.toLowerCase(), idx + term.length);
      if (chunks.length >= 8) {
        break;
      }
    }
    if (chunks.length >= 8) {
      break;
    }
  }

  if (chunks.length === 0) {
    return html.slice(0, 30000);
  }
  return chunks.join("\n<!-- split -->\n").slice(0, 70000);
}

async function parseFragranticaPageWithAI(
  client: OpenAI,
  html: string,
  perfumeName: string,
  brand: string
): Promise<{
  top: string[];
  middle: string[];
  base: string[];
  releaseYear?: number;
  rating?: number;
  reviewsCount?: number;
} | null> {
  const snippet = extractContextWindows(html, [
    "top notes",
    "middle notes",
    "heart notes",
    "base notes",
    "main accords",
    "launched in",
    "ratingValue",
    "reviewCount",
    "ratingCount",
  ]);

  const prompt = `Extract perfume metadata ONLY from this Fragrantica HTML snippet.

Perfume: "${perfumeName}"
Brand: "${brand}"

Return ONLY valid JSON:
{
  "top": ["string"],
  "middle": ["string"],
  "base": ["string"],
  "releaseYear": 2019,
  "rating": 4.2,
  "reviewsCount": 850
}

Rules:
- Use only the provided HTML snippet.
- Top/middle/base should be the perfume's own note pyramid, not recommendations.
- If a field is unavailable, omit it or return null.
- Max 5 notes per layer.

HTML:
${snippet}`;

  const parsed = await callModelAndParseJson(client, prompt, true);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const releaseYear =
    typeof obj.releaseYear === "number" && obj.releaseYear >= 1900 && obj.releaseYear <= 2100
      ? obj.releaseYear
      : undefined;
  const rating =
    typeof obj.rating === "number" && obj.rating >= 0 && obj.rating <= 5 ? obj.rating : undefined;
  const reviewsCount =
    typeof obj.reviewsCount === "number" && obj.reviewsCount >= 0 ? obj.reviewsCount : undefined;

  return {
    top: toStringArray(obj.top).slice(0, 5),
    middle: toStringArray(obj.middle).slice(0, 5),
    base: toStringArray(obj.base).slice(0, 5),
    releaseYear,
    rating,
    reviewsCount,
  };
}

function extractReleaseYearFromFragranticaHtml(html: string, description: string): number | undefined {
  const launchedMatch = stripHtml(html).match(/launched in\s+(19|20)\d{2}/i);
  if (launchedMatch) {
    const yearMatch = launchedMatch[0].match(/(19|20)\d{2}/);
    if (yearMatch) {
      return Number(yearMatch[0]);
    }
  }

  const datePublishedMatch = html.match(/"datePublished"\s*:\s*"((19|20)\d{2})/i);
  if (datePublishedMatch) {
    return Number(datePublishedMatch[1]);
  }

  const descYearMatch = description.match(/\b(19|20)\d{2}\b/);
  if (descYearMatch) {
    return Number(descYearMatch[0]);
  }

  return undefined;
}

function extractCommunityFromFragranticaHtml(
  html: string
): { rating: number; reviewsCount: number } | undefined {
  const ratingValueMatch = html.match(/"ratingValue"\s*:\s*"?([0-5](?:\.\d+)?)"?/i);
  const countMatch = html.match(
    /"(ratingCount|reviewCount)"\s*:\s*"?([0-9][0-9,]*)"?/i
  );

  if (ratingValueMatch?.[1] && countMatch?.[2]) {
    const rating = Number(ratingValueMatch[1]);
    const reviewsCount = Number(countMatch[2].replace(/,/g, ""));
    if (!Number.isNaN(rating) && !Number.isNaN(reviewsCount) && reviewsCount > 0) {
      return { rating, reviewsCount };
    }
  }

  const textMatch = stripHtml(html).match(
    /rating\s+([0-5](?:\.\d+)?)\s+out of 5 with\s+([0-9][0-9,]*)\s+votes/i
  );
  if (textMatch) {
    const rating = Number(textMatch[1]);
    const reviewsCount = Number(textMatch[2].replace(/,/g, ""));
    if (!Number.isNaN(rating) && !Number.isNaN(reviewsCount) && reviewsCount > 0) {
      return { rating, reviewsCount };
    }
  }

  return undefined;
}

function extractFragranticaRelevantHtml(html: string): string {
  const lower = html.toLowerCase();
  const anchorTerms = ["top notes", "middle notes", "heart notes", "base notes", "main accords"];
  const startCandidates = anchorTerms
    .map((term) => lower.indexOf(term))
    .filter((idx) => idx >= 0);

  if (startCandidates.length === 0) {
    return html.slice(0, 25000);
  }

  const start = Math.max(0, Math.min(...startCandidates) - 5000);
  const end = Math.min(html.length, start + 30000);
  return html.slice(start, end);
}

async function parseNotesFromFragranticaHtmlWithAI(
  client: OpenAI,
  html: string,
  perfumeName: string,
  brand: string
): Promise<{ top: string[]; middle: string[]; base: string[] } | null> {
  const relevantHtml = extractFragranticaRelevantHtml(html);
  const prompt = `Extract ONLY the official note pyramid for this perfume from the provided Fragrantica HTML snippet.

Perfume: "${perfumeName}"
Brand: "${brand}"

Rules:
- Use only information present in the HTML snippet.
- Ignore recommendations/other perfumes on page.
- Return up to 5 notes per layer.
- If a layer is not present, return empty array for that layer.
- Return ONLY valid JSON:
{
  "top": ["string"],
  "middle": ["string"],
  "base": ["string"]
}

HTML snippet:
${relevantHtml}`;

  const parsed = await callModelAndParseJson(client, prompt, true);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  return {
    top: toStringArray(obj.top).slice(0, 5),
    middle: toStringArray(obj.middle).slice(0, 5),
    base: toStringArray(obj.base).slice(0, 5),
  };
}

function extractNotesFromJsonLike(html: string): { top: string[]; middle: string[]; base: string[] } | null {
  const topMatch = html.match(/"(topNotes|top_notes)"\s*:\s*\[([^\]]*)\]/i);
  const midMatch = html.match(/"(middleNotes|heartNotes|middle_notes|heart_notes)"\s*:\s*\[([^\]]*)\]/i);
  const baseMatch = html.match(/"(baseNotes|base_notes)"\s*:\s*\[([^\]]*)\]/i);

  if (!topMatch || !midMatch || !baseMatch) {
    return null;
  }

  return {
    top: extractQuotedList(topMatch[2]).slice(0, 5),
    middle: extractQuotedList(midMatch[2]).slice(0, 5),
    base: extractQuotedList(baseMatch[2]).slice(0, 5),
  };
}

function extractNotesNearLabel(html: string, label: string): string[] {
  const index = html.toLowerCase().indexOf(label.toLowerCase());
  if (index < 0) {
    return [];
  }
  const chunk = html.slice(index, index + 4000);
  const anchorRegex = /<a[^>]*>([^<]+)<\/a>/gi;
  const notes: string[] = [];
  let m: RegExpExecArray | null = anchorRegex.exec(chunk);
  while (m && notes.length < 8) {
    const candidate = stripHtml(m[1]);
    if (
      candidate.length > 1 &&
      candidate.length < 40 &&
      !/fragrantica|perfume|parfum|home|search/i.test(candidate)
    ) {
      notes.push(candidate);
    }
    m = anchorRegex.exec(chunk);
  }
  return Array.from(new Set(notes)).slice(0, 5);
}

async function fetchFragranticaDetails(
  client: OpenAI,
  match: FragranticaMatch
): Promise<PerfumeIntelligenceResponse | null> {
  try {
    const response = await fetch(match.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PerfumeApp/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();

    const metaDescMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
    const description = metaDescMatch ? stripHtml(metaDescMatch[1]) : "";

    const pageAi = await parseFragranticaPageWithAI(client, html, match.name, match.brand);
    const notesFromAi = await parseNotesFromFragranticaHtmlWithAI(
      client,
      html,
      match.name,
      match.brand
    );
    const notesFromSections = {
      top: extractNotesNearLabel(html, "Top Notes"),
      middle: extractNotesNearLabel(html, "Middle Notes").length
        ? extractNotesNearLabel(html, "Middle Notes")
        : extractNotesNearLabel(html, "Heart Notes"),
      base: extractNotesNearLabel(html, "Base Notes"),
    };
    const notesFromJson = extractNotesFromJsonLike(html);
    const notes = pageAi && hasCompleteNoteLayers({
      top: pageAi.top,
      middle: pageAi.middle,
      base: pageAi.base,
    })
      ? { top: pageAi.top, middle: pageAi.middle, base: pageAi.base }
      : notesFromAi && hasCompleteNoteLayers(notesFromAi)
        ? notesFromAi
      : hasCompleteNoteLayers(notesFromSections)
        ? notesFromSections
        : notesFromJson || notesFromSections;

    if (!hasCompleteNoteLayers(notes)) {
      return null;
    }

    const accordCandidates = [
      ...extractNotesNearLabel(html, "Main accords"),
      ...extractNotesNearLabel(html, "Main Accords"),
    ]
      .map((item) => item.toLowerCase())
      .filter((item) => item.length > 1);

    const accords = Array.from(new Set(accordCandidates)).slice(0, 6).map((name, index) => ({
      name,
      strength: (index === 0 ? "dominant" : index < 3 ? "prominent" : "subtle") as
        | "dominant"
        | "prominent"
        | "subtle",
    }));

    const releaseYear =
      pageAi?.releaseYear ?? extractReleaseYearFromFragranticaHtml(html, description);
    const extractedCommunity = extractCommunityFromFragranticaHtml(html);
    const community = extractedCommunity || (pageAi?.rating && pageAi?.reviewsCount
      ? { rating: pageAi.rating, reviewsCount: pageAi.reviewsCount }
      : undefined);
    const gender = /for women and men|for men and women|unisex/i.test(description)
      ? "unisex"
      : /for men/i.test(description)
        ? "male"
        : /for women/i.test(description)
          ? "female"
          : undefined;

    return {
      found: true,
      confidence: accords.length > 0 ? "high" : "medium",
      ambiguous: false,
      perfume: {
        name: match.name,
        brand: match.brand,
        releaseYear,
        perfumer: undefined,
        gender,
        fragranceFamily: accords[0]?.name,
        accords,
        notes,
        performance: undefined,
        description:
          description ||
          `${notes.top[0]} opens the scent, evolving through a ${notes.middle[0]} heart into ${notes.base[0]} on dry down.`,
        pricing: undefined,
        availability: [
          {
            store: "Fragrantica",
            region: "Global",
            url: match.url,
          },
        ],
        community,
      },
      suggestions: [],
    };
  } catch {
    return null;
  }
}

function sanitizeConfidence(value: unknown): ConfidenceLevel {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "low";
}

function sanitizeAccords(value: unknown): Array<{
  name: string;
  strength: "dominant" | "prominent" | "subtle";
}> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const obj = item as Record<string, unknown>;
      const strength: "dominant" | "prominent" | "subtle" =
        obj.strength === "dominant" || obj.strength === "prominent" || obj.strength === "subtle"
          ? obj.strength
          : "subtle";
      return {
        name: typeof obj.name === "string" ? obj.name : "",
        strength,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item && item.name.trim().length > 0));
}

function hasCompleteNoteLayers(notes: { top: string[]; middle: string[]; base: string[] }): boolean {
  return notes.top.length > 0 && notes.middle.length > 0 && notes.base.length > 0;
}

function mergeAmbiguityOptions(...lists: AmbiguityOption[][]): AmbiguityOption[] {
  const map = new Map<string, AmbiguityOption>();
  for (const list of lists) {
    for (const option of list) {
      const key = `${normalizeInput(option.name)}|${normalizeInput(option.brand)}`;
      if (!map.has(key)) {
        map.set(key, option);
      }
    }
  }
  return Array.from(map.values());
}

async function callModelAndParseJson(
  client: OpenAI,
  prompt: string,
  retryOnceOnInvalidJson = true
): Promise<unknown | null> {
  const maxAttempts = retryOnceOnInvalidJson ? 2 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const attemptPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nIMPORTANT: Your previous response was invalid JSON. Return ONLY valid JSON with no extra text.`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      max_tokens: 1600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: attemptPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      continue;
    }

    const parsed = extractJsonObject(content);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

async function detectAmbiguousName(
  client: OpenAI,
  originalQuery: string,
  resolvedPerfumeName: string
): Promise<AmbiguityCheckResponse> {
  const prompt = `You are resolving perfume name collisions across brands.

User query: "${originalQuery}"
Exact perfume title to check: "${resolvedPerfumeName}"

Rules:
- Find perfumes that share the same fragrance title across different brands.
- Focus on exact title collisions first (case-insensitive).
- Include EVERY known brand option you can confidently identify for this exact title.
- Exclude unrelated "similar" perfumes with different titles.
- If only one brand is known for that title, ambiguous = false.
- If two or more brands are known for that title, ambiguous = true.
- Return ONLY valid JSON.

{
  "title": "Wood Infusion",
  "ambiguous": true,
  "options": [
    {
      "name": "Wood Infusion",
      "brand": "Brand A",
      "reason": "Exact same fragrance title used by multiple brands."
    },
    {
      "name": "Wood Infusion",
      "brand": "Brand B",
      "reason": "Exact same fragrance title used by multiple brands."
    }
  ]
}`;

  const parsed = await callModelAndParseJson(client, prompt, true);
  if (!parsed || typeof parsed !== "object") {
    return { ambiguous: false, options: [] };
  }

  const obj = parsed as Record<string, unknown>;
  const options = sanitizeAmbiguityOptions(obj.options);
  return {
    ambiguous: options.length > 1 || (Boolean(obj.ambiguous) && options.length > 0),
    options,
  };
}

function sanitizeResponse(input: unknown): PerfumeIntelligenceResponse {
  const fallback: PerfumeIntelligenceResponse = {
    found: false,
    confidence: "low",
    ambiguous: false,
    perfume: null,
    suggestions: [
      {
        name: "Bleu de Chanel",
        brand: "Chanel",
        reason: "Widely known and often compared in modern fresh-woody categories.",
      },
      {
        name: "Acqua di Gio Profumo",
        brand: "Giorgio Armani",
        reason: "Popular benchmark fragrance for aquatic aromatic styles.",
      },
    ],
  };

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const data = input as Record<string, unknown>;
  const confidence = sanitizeConfidence(data.confidence);
  let found = Boolean(data.found);
  const ambiguous = Boolean(data.ambiguous);

  // Strict rule: low confidence cannot be treated as found.
  if (confidence === "low") {
    found = false;
  }

  if (!found) {
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
          .map((item) => {
            if (!item || typeof item !== "object") {
              return null;
            }
            const obj = item as Record<string, unknown>;
            return {
              name: typeof obj.name === "string" ? obj.name : "Unknown Perfume",
              brand: typeof obj.brand === "string" ? obj.brand : "Unknown Brand",
              reason:
                typeof obj.reason === "string"
                  ? obj.reason
                  : "Popular fragrance with related scent DNA.",
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : [];

    return {
      found: false,
      confidence: "low",
      ambiguous,
      perfume: null,
      suggestions: suggestions.length > 0 ? suggestions : fallback.suggestions,
    };
  }

  const perfumeRaw = data.perfume;
  if (!perfumeRaw || typeof perfumeRaw !== "object") {
    return fallback;
  }

  const perfume = perfumeRaw as Record<string, unknown>;
  const notesRaw =
    perfume.notes && typeof perfume.notes === "object"
      ? (perfume.notes as Record<string, unknown>)
      : {};
  const performanceRaw =
    perfume.performance && typeof perfume.performance === "object"
      ? (perfume.performance as Record<string, unknown>)
      : null;
  const pricingRaw =
    perfume.pricing && typeof perfume.pricing === "object"
      ? (perfume.pricing as Record<string, unknown>)
      : null;

  const notes = {
    top: toStringArray(notesRaw.top),
    middle: toStringArray(notesRaw.middle),
    base: toStringArray(notesRaw.base),
  };

  return {
    found: true,
    confidence,
    ambiguous: false,
    perfume: {
      name: typeof perfume.name === "string" ? perfume.name : "Unknown Perfume",
      brand: typeof perfume.brand === "string" ? perfume.brand : "Unknown Brand",
      releaseYear: undefined,
      perfumer: typeof perfume.perfumer === "string" ? perfume.perfumer : undefined,
      gender:
        perfume.gender === "male" || perfume.gender === "female" || perfume.gender === "unisex"
          ? perfume.gender
          : undefined,
      fragranceFamily:
        typeof perfume.fragranceFamily === "string" ? perfume.fragranceFamily : undefined,
      accords: sanitizeAccords(perfume.accords),
      notes,
      performance: performanceRaw
        ? {
            longevity:
              performanceRaw.longevity === "poor" ||
              performanceRaw.longevity === "moderate" ||
              performanceRaw.longevity === "long-lasting" ||
              performanceRaw.longevity === "very long-lasting"
                ? performanceRaw.longevity
                : "moderate",
            sillage:
              performanceRaw.sillage === "soft" ||
              performanceRaw.sillage === "moderate" ||
              performanceRaw.sillage === "strong" ||
              performanceRaw.sillage === "enormous"
                ? performanceRaw.sillage
                : "moderate",
          }
        : undefined,
      description:
        typeof perfume.description === "string"
          ? perfume.description
          : "No description available.",
      pricing: pricingRaw
        ? {
            averageUSD:
              typeof pricingRaw.averageUSD === "number" ? pricingRaw.averageUSD : 0,
            size: typeof pricingRaw.size === "string" ? pricingRaw.size : "100ml",
          }
        : undefined,
      availability: Array.isArray(perfume.availability)
        ? perfume.availability
            .map((item) => {
              if (!item || typeof item !== "object") {
                return null;
              }
              const obj = item as Record<string, unknown>;
              return {
                store: typeof obj.store === "string" ? obj.store : "Retailer",
                region: typeof obj.region === "string" ? obj.region : "Global",
                url: typeof obj.url === "string" ? obj.url : "#",
              };
            })
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
        : [],
      community: undefined,
    },
    suggestions: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PerfumeIntelligenceBody;
    const perfumeName = body.perfumeName?.trim();

    if (!perfumeName) {
      return NextResponse.json(
        { success: false, error: "perfumeName is required." } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured." } as ApiResponse<null>,
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });
    const queryParts = splitPerfumeQuery(perfumeName);
    const titleQuery = queryParts.title || perfumeName;
    const fragranticaMatches = await fetchFragranticaExactTitleMatches(titleQuery);
    const queryHasBrandHint = hasBrandHintInQuery(perfumeName);

    if (!queryHasBrandHint && fragranticaMatches.length > 1) {
      return NextResponse.json({
        success: true,
        data: {
          found: false,
          confidence: "low",
          ambiguous: true,
          perfume: null,
          suggestions: toAmbiguityOptions(fragranticaMatches),
        },
      } as ApiResponse<PerfumeIntelligenceResponse>);
    }

    const selectedFragranticaMatch = selectFragranticaMatchByBrandHint(
      fragranticaMatches,
      perfumeName
    );

    if (selectedFragranticaMatch) {
      const fragranticaFirst = await fetchFragranticaDetails(client, selectedFragranticaMatch);
      if (fragranticaFirst?.found && fragranticaFirst.perfume) {
        return NextResponse.json({
          success: true,
          data: fragranticaFirst,
        } as ApiResponse<PerfumeIntelligenceResponse>);
      }
    }

    const prompt = getPerfumeIntelligencePrompt(perfumeName);
    const parsed = await callModelAndParseJson(client, prompt, true);

    // Strict rule: retry once on invalid JSON; if still invalid, fail.
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON from model after retry." } as ApiResponse<null>,
        { status: 502 }
      );
    }

    let sanitized = sanitizeResponse(parsed);

    const queryHasBrandHintWithBrand = hasBrandHintInQuery(
      perfumeName,
      sanitized.perfume ? sanitized.perfume.brand : undefined
    );

    if (!queryHasBrandHintWithBrand) {
      const ambiguityCandidate =
        sanitized.found && sanitized.perfume ? sanitized.perfume.name : titleQuery;
      const realSourceMatches = await fetchFragranticaExactTitleMatches(ambiguityCandidate);
      const primary = await detectAmbiguousName(client, perfumeName, ambiguityCandidate);
      const secondary =
        normalizeInput(ambiguityCandidate) !== normalizeInput(titleQuery)
          ? await detectAmbiguousName(client, perfumeName, titleQuery)
          : { ambiguous: false, options: [] };
      const mergedOptions = mergeAmbiguityOptions(
        toAmbiguityOptions(realSourceMatches),
        primary.options,
        secondary.options
      );
      const isAmbiguous =
        mergedOptions.length > 1 ||
        realSourceMatches.length > 1 ||
        primary.ambiguous ||
        secondary.ambiguous;

      if (isAmbiguous) {
        sanitized = {
          found: false,
          confidence: "low",
          ambiguous: true,
          perfume: null,
          suggestions: mergedOptions,
        };
      }
    }

    // Strict rule: if any note layer is missing, reject response.
    if (sanitized.found && sanitized.perfume && !hasCompleteNoteLayers(sanitized.perfume.notes)) {
      return NextResponse.json(
        { success: false, error: "Incomplete note pyramid from model." } as ApiResponse<null>,
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sanitized,
    } as ApiResponse<PerfumeIntelligenceResponse>);
  } catch (error) {
    console.error("Perfume intelligence error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch perfume details.",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
