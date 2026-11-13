"use client";

import { useRef, useState } from "react";
import type { ShelfPerfume, ShelfPhoto } from "@/types";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import {
  choosePhoto,
  createRender,
  findPhotoAndRender,
  getPhotoCandidates,
  removePhoto,
  setPhotoDisplay,
  uploadPhoto,
} from "@/lib/hooks/useShelf";

function host(url?: string | null): string | null {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

type Busy = "find" | "auto" | "choose" | "upload" | "render" | "display" | "remove";

const DISPLAY_OPTIONS: Array<{ value: ShelfPhoto["display"]; label: string }> = [
  { value: "render", label: "Render" },
  { value: "photo", label: "Photo" },
  { value: "illustration", label: "Illustration" },
];

/** Real photo + AI render + illustration, with a choice of which the shelf shows. */
export default function PhotoManager({ item }: { item: ShelfPerfume }) {
  const [busy, setBusy] = useState<Busy | null>(null);
  const [candidates, setCandidates] = useState<{ pageUrl: string | null; images: string[] } | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const photo = item.photo;

  const run = async (kind: Busy, action: () => Promise<unknown>) => {
    setBusy(kind);
    setMessage(null);
    try {
      await action();
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  /** After a new photo is set, make a matching render (the old one was of the previous photo). */
  const renderAfter = async (setPhoto: () => Promise<unknown>) => {
    await setPhoto();
    setBusy("render");
    try {
      await createRender(item.id);
    } catch (e) {
      setMessage({ tone: "info", text: `Photo saved, but the render failed: ${e instanceof Error ? e.message : "try again"}.` });
    }
  };

  const source = host(photo?.sourceUrl);
  const disabled = busy !== null;

  return (
    <div className="space-y-4">
      {photo && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-soft">Show on shelf</span>
          <div role="radiogroup" aria-label="Show on shelf" className="flex gap-1">
            {DISPLAY_OPTIONS.filter((o) => o.value !== "render" || photo.renderSrc).map((o) => (
              <button
                key={o.value}
                role="radio"
                aria-checked={photo.display === o.value}
                disabled={disabled}
                onClick={() => run("display", () => setPhotoDisplay(item.id, o.value))}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm disabled:opacity-50 ${
                  photo.display === o.value ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {photo && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Real photo", src: photo.src },
            ...(photo.renderSrc ? [{ label: "AI render", src: photo.renderSrc }] : []),
          ].map((v) => (
            <figure key={v.label} className="rounded-sm border border-line bg-card p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- private image from our authenticated route */}
              <img src={v.src} alt={v.label} className="mx-auto h-36 w-auto object-contain" />
              <figcaption className="mt-1 text-xs text-ink-faint">{v.label}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="text-sm text-ink-soft">
        {photo
          ? photo.origin === "upload"
            ? "Using your own photo."
            : `Photo from ${source ?? "the brand's site"}.`
          : "Showing an illustration. Find the brand's photo (an AI render is made from it) or upload your own."}{" "}
        <span className="text-ink-faint">Photos and renders are private — the public collection shows illustrations.</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {!photo && (
          <Button
            size="sm"
            isLoading={busy === "auto"}
            disabled={disabled}
            onClick={() =>
              run("auto", async () => {
                const updated = await findPhotoAndRender(item.id);
                if (!updated) setMessage({ tone: "info", text: "No product photo found — choose from the search or upload your own." });
              })
            }
          >
            {busy === "auto" ? "Finding photo & rendering…" : "Find photo"}
          </Button>
        )}
        {photo && (
          <Button size="sm" isLoading={busy === "render"} disabled={disabled} onClick={() => run("render", () => createRender(item.id))}>
            {busy === "render" ? "Rendering… (~20 s)" : photo.renderSrc ? "Regenerate render" : "Create render"}
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          isLoading={busy === "find"}
          disabled={disabled}
          onClick={() =>
            run("find", async () => {
              const found = await getPhotoCandidates(item.id);
              setCandidates(found);
              if (found.images.length === 0) {
                setMessage({ tone: "info", text: "No product photos found online — try uploading your own." });
              }
            })
          }
        >
          {busy === "find" ? "Searching…" : "Choose a photo"}
        </Button>
        <Button size="sm" variant="secondary" isLoading={busy === "upload"} disabled={disabled} onClick={() => fileInput.current?.click()}>
          Upload photo
        </Button>
        {photo && (
          <Button size="sm" variant="ghost" isLoading={busy === "remove"} disabled={disabled} onClick={() => run("remove", () => removePhoto(item.id))}>
            Remove photo
          </Button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (file.size > 25 * 1024 * 1024) {
              setMessage({ tone: "error", text: "That file is very large — choose a photo under 25 MB." });
              return;
            }
            void run("upload", () => renderAfter(() => uploadPhoto(item.id, file)));
          }}
        />
      </div>

      {busy === "render" && <p className="text-xs text-ink-faint">Creating an AI studio render from the photo…</p>}
      {message && <Notice tone={message.tone === "error" ? "error" : "info"}>{message.text}</Notice>}

      {candidates && candidates.images.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-ink-faint">
            Choose a photo{host(candidates.pageUrl) ? ` (found on ${host(candidates.pageUrl)})` : ""} — a render is made from it:
          </p>
          <ul className="grid grid-cols-4 gap-2">
            {candidates.images.map((src) => (
              <li key={src}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    run("choose", async () => {
                      setCandidates(null);
                      await renderAfter(() => choosePhoto(item.id, src, candidates.pageUrl));
                    })
                  }
                  className="flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-line bg-white p-1 hover:border-ink disabled:opacity-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview of the brand's own image before it is copied */}
                  <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
