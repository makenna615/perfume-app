import "server-only";
import { lookup } from "node:dns/promises";
import net from "node:net";
import sharp from "sharp";
import { del, get, put } from "@vercel/blob";
import { getAIService } from "@/lib/ai/factory";
import { getBottleRenderPrompt, getProductPagePrompt } from "@/lib/ai/prompts";
import type { SourceLink } from "@/types";

// ---------------------------------------------------------------------------
// Safe fetching (SSRF protection)
// ---------------------------------------------------------------------------
// The server downloads pages and images from addresses that partly come from web search.
// Without these checks a malicious address could make the server request internal
// systems (localhost, the cloud metadata service, private networks).

// Honest identifier — stores block clients that pretend to be a browser, and this is
// the respectful way to fetch from someone's site anyway.
const USER_AGENT = "PerfumeApp/1.0 (personal fragrance collection; product image lookup)";

export class PhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoError";
  }
}

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b, c] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 || // this-network, private, loopback, multicast/reserved
      (a === 100 && b >= 64 && b <= 127) ||            // carrier-grade NAT
      (a === 169 && b === 254) ||                      // link-local incl. cloud metadata 169.254.169.254
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) || // IETF protocol assignments, TEST-NET-1
      (a === 198 && (b === 18 || b === 19)) ||          // benchmarking
      (a === 198 && b === 51 && c === 100) ||           // TEST-NET-2
      (a === 203 && b === 0 && c === 113)               // TEST-NET-3
    );
  }
  const v6 = ip.toLowerCase();
  // IPv4-mapped (::ffff:a.b.c.d). Node normalizes the dotted form to hex (::ffff:7f00:1),
  // so decode both — otherwise ::ffff:127.0.0.1 would slip through as "public".
  if (v6.startsWith("::ffff:")) {
    const rest = v6.slice(7);
    if (net.isIPv4(rest)) return isPrivateAddress(rest);
    const groups = rest.split(":");
    if (groups.length === 2 && groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) {
      const [hi, lo] = groups.map((g) => parseInt(g, 16));
      return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    return true; // unrecognized mapped form: refuse
  }
  // Ranges that can tunnel to arbitrary IPv4 targets (NAT64, 6to4, deprecated IPv4-compatible).
  if (v6.startsWith("64:ff9b:") || v6.startsWith("2002:") || /^::\d/.test(v6)) return true;
  return (
    v6 === "::" || v6 === "::1" ||
    v6.startsWith("fc") || v6.startsWith("fd") ||   // unique local
    v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") || // link-local
    v6.startsWith("ff")                               // multicast
  );
}

async function assertPublicHttpsUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PhotoError("Invalid address.");
  }
  if (url.protocol !== "https:") throw new PhotoError("Only https addresses are allowed.");
  if (url.username || url.password) throw new PhotoError("Addresses with credentials are not allowed.");
  if (url.port && url.port !== "443") throw new PhotoError("Non-standard ports are not allowed.");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host) ? [host] : (await lookup(host, { all: true, verbatim: true })).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new PhotoError("That address points to a private network.");
  }
  return url;
}

async function safeFetch(
  raw: string,
  { maxBytes, accept, timeoutMs = 10_000 }: { maxBytes: number; accept: string; timeoutMs?: number }
): Promise<{ body: Buffer; contentType: string; url: URL }> {
  let next = raw;
  for (let hop = 0; hop <= 3; hop += 1) {
    const url = await assertPublicHttpsUrl(next); // re-checked on every redirect hop
    const request = () =>
      fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": USER_AGENT, Accept: accept },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    let response = await request();
    // Small stores rate-limit bursts. Wait politely once (honouring Retry-After, max 3 s) and retry.
    if (response.status === 429 || response.status === 503) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 3000) : 1500;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      response = await request();
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new PhotoError("Bad redirect.");
      next = new URL(location, url).href;
      continue;
    }
    if (!response.ok || !response.body) throw new PhotoError(`The site responded with ${response.status}.`);

    const declared = Number(response.headers.get("content-length") || 0);
    if (declared > maxBytes) throw new PhotoError("File is too large.");

    // Stream with a hard cap so a lying content-length can't exhaust memory.
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new PhotoError("File is too large.");
      }
      chunks.push(value);
    }
    return { body: Buffer.concat(chunks), contentType: response.headers.get("content-type") ?? "", url };
  }
  throw new PhotoError("Too many redirects.");
}

// ---------------------------------------------------------------------------
// Finding product photos
// ---------------------------------------------------------------------------

// Never used for photos: fragrance databases (community photos, banners), social media
// and open marketplaces. Brand sites come first; regular retailers are a fallback, since
// their product shots are normally the brand-supplied packshots.
const NEVER_PHOTO_SITES =
  /(^|\.)(fragrantica|parfumo|basenotes|osmoz|reddit|youtube|instagram|tiktok|facebook|pinterest|wikipedia|google|amazon|ebay|aliexpress|temu|etsy)\./i;

function absoluteHttps(src: string, base: URL): string | null {
  try {
    const url = new URL(src.replace(/&amp;/g, "&").replace(/^\/\//, "https://"), base);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Shopify stores expose /products/<handle>.json with every product image. */
async function shopifyImages(page: URL): Promise<string[]> {
  const match = page.pathname.match(/^(.*\/products\/[^/?#]+)/);
  if (!match) return [];
  try {
    const { body } = await safeFetch(`${page.origin}${match[1].replace(/\.json$/, "")}.json`, {
      maxBytes: 2_000_000,
      accept: "application/json",
    });
    const data = JSON.parse(body.toString("utf8")) as { product?: { images?: Array<{ src?: string }> } };
    return (data.product?.images ?? [])
      .map((img) => (img.src ? absoluteHttps(img.src, page) : null))
      .filter((u): u is string => Boolean(u));
  } catch (error) {
    console.warn(`[photos] product feed failed for ${page.hostname}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/** Generic sites: the page's link-preview images (og:image / twitter:image). */
async function metaImages(page: URL): Promise<string[]> {
  try {
    const { body } = await safeFetch(page.href, { maxBytes: 3_000_000, accept: "text/html" });
    const html = body.toString("utf8");
    const found: string[] = [];
    const re = /<meta\s+[^>]*(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/gi;
    for (const tag of html.match(re) ?? []) {
      const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
      const abs = content ? absoluteHttps(content, page) : null;
      if (abs) found.push(abs);
    }
    return found;
  } catch (error) {
    console.warn(`[photos] page fetch failed for ${page.hostname}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

function slugWords(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);
}

function toHttpsUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && !NEVER_PHOTO_SITES.test(u.hostname) ? u : null;
  } catch {
    return null;
  }
}

/**
 * Ranks product pages: the brand's own site first (domain contains the brand name), then
 * retailer product pages. Only asks the web search when no brand page is already known.
 */
async function findProductPages(name: string, brand: string, sources: SourceLink[]): Promise<URL[]> {
  const nameWords = slugWords(name);
  const brandCompact = slugWords(brand).join("");
  const brandWords = slugWords(brand).filter((w) => w.length >= 5);
  const isBrandSite = (u: URL) => {
    const host = u.hostname.replace(/^www\./, "").replace(/[^a-z0-9]/g, "");
    return (brandCompact.length >= 4 && host.includes(brandCompact)) || brandWords.some((w) => host.includes(w));
  };
  const score = (u: URL) =>
    (isBrandSite(u) ? 10 : 0) +
    (u.pathname.includes("/products/") || u.pathname.includes("/p/") ? 2 : 0) +
    nameWords.filter((w) => u.href.toLowerCase().includes(w)).length;

  let pages = sources.map((s) => toHttpsUrl(s.url)).filter((u): u is URL => Boolean(u));

  if (!pages.some(isBrandSite)) {
    // The search answer is only a hint: every address is still validated and must actually
    // yield images before anything is stored.
    try {
      const { data, sources: consulted } = await getAIService().searchWebJSON({
        task: "product-page",
        ...getProductPagePrompt(name, brand),
      });
      const found = [typeof data.url === "string" ? data.url : "", ...consulted.map((s) => s.url)]
        .map(toHttpsUrl)
        .filter((u): u is URL => Boolean(u));
      pages = [...found, ...pages];
    } catch (error) {
      console.warn("[photos] product page search failed:", error instanceof Error ? error.message : error);
    }
  }

  const seen = new Set<string>();
  return pages
    .filter((u) => score(u) > 0 && !seen.has(u.href) && Boolean(seen.add(u.href)))
    .sort((a, b) => score(b) - score(a))
    .slice(0, 4);
}

export interface PhotoCandidates {
  pageUrl: string | null;
  images: string[];
}

/** Product images grouped by the page they came from, best page first. */
async function findPhotoSets(name: string, brand: string, sources: SourceLink[]): Promise<PhotoCandidates[]> {
  const sets: PhotoCandidates[] = [];
  for (const page of await findProductPages(name, brand, sources)) {
    const images = Array.from(new Set((await shopifyImages(page)).concat(await metaImages(page)))).slice(0, 8);
    if (images.length > 0) sets.push({ pageUrl: page.href, images });
    if (sets.length >= 2) break;
  }
  return sets;
}

/** For the photo picker: images from the best pages, merged. */
export async function findPhotoCandidates(name: string, brand: string, sources: SourceLink[]): Promise<PhotoCandidates> {
  const sets = await findPhotoSets(name, brand, sources);
  return {
    pageUrl: sets[0]?.pageUrl ?? null,
    images: Array.from(new Set(sets.flatMap((s) => s.images))).slice(0, 12),
  };
}

// ---------------------------------------------------------------------------
// Processing and storage (private Vercel Blob)
// ---------------------------------------------------------------------------

export interface StoredImage {
  pathname: string;
  width: number;
  height: number;
  updatedAt: string;
}

/** Stored in shelf_perfumes.photo. The real photo, an optional AI render, and what to show. */
export interface StoredPhoto extends StoredImage {
  origin: "brand" | "upload";
  sourceUrl?: string;
  render?: StoredImage;
  display?: "render" | "photo" | "illustration";
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Decodes and re-encodes the image. Anything that isn't a real image fails here, and
 * re-encoding drops all metadata (EXIF, GPS location, camera details) and hidden payloads.
 * Trimming removes the empty studio background around the bottle so it fills its niche.
 */
async function processImage(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const encode = (trim: boolean) => {
    let pipeline = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" }).rotate();
    if (trim) pipeline = pipeline.trim({ threshold: 22 });
    return pipeline
      .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 92 })
      .toBuffer({ resolveWithObject: true });
  };
  try {
    const { data, info } = await encode(true).catch(() => encode(false)); // trim fails on blank images
    return { data, width: info.width, height: info.height };
  } catch {
    throw new PhotoError("That file isn't a supported image.");
  }
}

async function putImage(itemId: string, kind: "photo" | "render", data: Buffer, width: number, height: number): Promise<StoredImage> {
  const blob = await put(`shelf/${itemId}-${kind}.webp`, data, {
    access: "private",
    contentType: "image/webp",
    addRandomSuffix: true,
  });
  return { pathname: blob.pathname, width, height, updatedAt: new Date().toISOString() };
}

async function downloadImage(imageUrl: string): Promise<Buffer> {
  const { body, contentType } = await safeFetch(imageUrl, { maxBytes: 10_000_000, accept: "image/*" });
  if (contentType && !/^image\//i.test(contentType)) throw new PhotoError("That address isn't an image.");
  return body;
}

export async function storePhotoFromUrl(itemId: string, imageUrl: string, sourceUrl?: string): Promise<StoredPhoto> {
  const { data, width, height } = await processImage(await downloadImage(imageUrl));
  const stored = await putImage(itemId, "photo", data, width, height);
  return { ...stored, origin: "brand", sourceUrl, display: "photo" };
}

export async function storeUploadedPhoto(itemId: string, file: Buffer): Promise<StoredPhoto> {
  if (file.byteLength > MAX_UPLOAD_BYTES) throw new PhotoError("Photos must be 5 MB or smaller.");
  const { data, width, height } = await processImage(file);
  const stored = await putImage(itemId, "photo", data, width, height);
  return { ...stored, origin: "upload", display: "photo" };
}

/**
 * Finds the brand's product photo and stores the best bottle-shaped one. Wide images
 * (banners, lifestyle shots) are skipped unless nothing better exists.
 */
export async function findAndStoreBestPhoto(
  itemId: string,
  name: string,
  brand: string,
  sources: SourceLink[]
): Promise<StoredPhoto | null> {
  const sets = await findPhotoSets(name, brand, sources);
  let fallback: { data: Buffer; width: number; height: number; pageUrl: string | null } | null = null;
  let attempts = 0;
  for (const set of sets) {
    for (const image of set.images) {
      if (attempts++ >= 6) break;
      try {
        const processed = await processImage(await downloadImage(image));
        if (processed.width / processed.height <= 1.25) {
          const stored = await putImage(itemId, "photo", processed.data, processed.width, processed.height);
          return { ...stored, origin: "brand", sourceUrl: set.pageUrl ?? undefined, display: "photo" };
        }
        fallback ??= { ...processed, pageUrl: set.pageUrl };
      } catch {
        continue;
      }
    }
  }
  if (!fallback) return null;
  const stored = await putImage(itemId, "photo", fallback.data, fallback.width, fallback.height);
  return { ...stored, origin: "brand", sourceUrl: fallback.pageUrl ?? undefined, display: "photo" };
}

/** AI studio render of the bottle, made from the stored real photo. */
export async function generateRender(itemId: string, photo: StoredPhoto, name: string, brand: string): Promise<StoredImage> {
  const original = await get(photo.pathname, { access: "private" });
  if (!original || original.statusCode !== 200) throw new PhotoError("The original photo is missing.");
  const reference = await sharp(Buffer.from(await new Response(original.stream).arrayBuffer())).png().toBuffer();

  const png = await getAIService().renderFromReference(reference, getBottleRenderPrompt(name, brand));
  const { data, width, height } = await processImage(png); // re-encode + trim transparent margins
  return putImage(itemId, "render", data, width, height);
}

export async function deleteStoredPhoto(pathname: string | undefined | null): Promise<void> {
  if (!pathname) return;
  try {
    await del(pathname);
  } catch (error) {
    console.warn("Couldn't delete old photo:", error instanceof Error ? error.message : error);
  }
}

/** Deletes every file belonging to a photo record (the photo and its render). */
export async function deletePhotoFiles(photo: Partial<StoredPhoto> | null | undefined): Promise<void> {
  await Promise.all([deleteStoredPhoto(photo?.pathname), deleteStoredPhoto(photo?.render?.pathname)]);
}

export async function readStoredPhoto(pathname: string) {
  return get(pathname, { access: "private" });
}
