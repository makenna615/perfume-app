"use client";

import Link from "next/link";
import { useState } from "react";
import type { BottleSpec, ShelfPerfume, ShelfStatus } from "@/types";
import BottleIllustration from "@/components/features/shelf/BottleIllustration";
import BottleDisplay from "@/components/features/shelf/BottleDisplay";
import PhotoManager from "@/components/features/shelf/PhotoManager";
import { Stars, type DisplayItem } from "@/components/features/shelf/ShelfViews";
import NotePyramid from "@/components/features/NotePyramid";
import AccordBars from "@/components/features/AccordBars";
import SourceLinks from "@/components/features/SourceLinks";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import Tag from "@/components/ui/Tag";
import { BOTTLE_SHAPES, CAP_SHAPES, LIMITS, SHELF_STATUSES, STATUS_LABEL } from "@/lib/shelf/model";
import { removeShelfItem, updateShelfItem } from "@/lib/hooks/useShelf";
import { capitalize } from "@/lib/format";

function Breakdown({ item }: { item: DisplayItem }) {
  const { details } = item;
  const hasNotes = details.notes.top.length + details.notes.middle.length + details.notes.base.length > 0;
  return (
    <div className="space-y-6">
      {details.fragranceFamily && <p className="font-display text-xl italic text-resin">{details.fragranceFamily}</p>}
      {details.description && <p className="leading-relaxed text-ink-soft">{details.description}</p>}
      {hasNotes ? (
        <NotePyramid notes={details.notes} structure={details.notesStructure} />
      ) : (
        <p className="text-sm text-ink-faint">No note breakdown saved for this perfume.</p>
      )}
      {details.accords.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Accords</p>
          <AccordBars accords={details.accords} />
        </div>
      )}
      {details.source === "web" ? (
        <p><SourceLinks sources={details.sources} /></p>
      ) : details.source ? (
        <p className="text-xs text-ink-faint">
          {details.source === "manual"
            ? "Notes added manually."
            : `Notes from ${details.source === "fragrantica" ? "Fragrantica" : "AI knowledge — may contain mistakes"}.`}
        </p>
      ) : null}
    </div>
  );
}

function Header({ item }: { item: DisplayItem }) {
  const meta = [item.concentration, item.details.releaseYear?.toString()].filter(Boolean).join(" · ");
  return (
    <div className="flex items-end gap-5">
      <div className="shrink-0">
        <BottleDisplay bottle={item.bottle} status={item.status} photo={item.photo} size="hero" label={`${item.name} by ${item.brand}`} />
      </div>
      <div className="pb-1">
        {meta && <p className="text-sm text-ink-soft">{meta}</p>}
        {item.details.perfumers.length > 0 && <p className="text-sm text-ink-faint">by {item.details.perfumers.join(", ")}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Tag tone="resin">{STATUS_LABEL[item.status]}</Tag>
          {item.favorite && <Tag tone="middle">♥ Favorite</Tag>}
          <Stars rating={item.rating} />
        </div>
      </div>
    </div>
  );
}

/** Read-only sheet used on the public collection page. */
export function PublicPerfumeSheet({ item }: { item: DisplayItem }) {
  return (
    <div className="space-y-8">
      <Header item={item} />
      <Breakdown item={item} />
    </div>
  );
}

function BottleEditor({ item, onSaved }: { item: ShelfPerfume; onSaved: () => void }) {
  const [bottle, setBottle] = useState<BottleSpec>(item.bottle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = (patch: Partial<BottleSpec>) => setBottle((b) => ({ ...b, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateShelfItem(item.id, { bottle: { ...bottle, accuracy: "known" } });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the bottle.");
    } finally {
      setSaving(false);
    }
  };

  const select = "w-full rounded-sm border border-line bg-card px-2 py-1.5 text-sm";
  return (
    <div className="grid gap-5 sm:grid-cols-[7rem_1fr]">
      <BottleIllustration bottle={bottle} status={item.status === "wishlist" ? "full" : item.status} className="mx-auto h-36 w-auto" />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="eyebrow">Bottle shape</span>
          <select className={select} value={bottle.shape} onChange={(e) => update({ shape: e.target.value as BottleSpec["shape"] })}>
            {BOTTLE_SHAPES.map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="eyebrow">Glass</span>
          <select className={select} value={bottle.glassFinish} onChange={(e) => update({ glassFinish: e.target.value as BottleSpec["glassFinish"] })}>
            {(["clear", "frosted", "tinted", "opaque"] as const).map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="eyebrow">Cap shape</span>
          <select className={select} value={bottle.cap.shape} onChange={(e) => update({ cap: { ...bottle.cap, shape: e.target.value as BottleSpec["cap"]["shape"] } })}>
            {CAP_SHAPES.map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="eyebrow">Cap finish</span>
          <select className={select} value={bottle.cap.finish} onChange={(e) => update({ cap: { ...bottle.cap, finish: e.target.value as BottleSpec["cap"]["finish"] } })}>
            {(["metallic", "matte", "glossy"] as const).map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </label>
        {(
          [
            ["Glass colour", bottle.glassColor, (v: string) => update({ glassColor: v })],
            ["Juice colour", bottle.liquidColor, (v: string) => update({ liquidColor: v })],
            ["Cap colour", bottle.cap.color, (v: string) => update({ cap: { ...bottle.cap, color: v } })],
          ] as const
        ).map(([label, value, onChange]) => (
          <label key={label} className="flex items-center justify-between gap-2">
            <span className="eyebrow">{label}</span>
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded-sm border border-line bg-card" />
          </label>
        ))}
        <label className="flex items-center justify-between gap-2">
          <span className="eyebrow">Label</span>
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(bottle.labelColor)}
              onChange={(e) => update({ labelColor: e.target.checked ? "#ffffff" : undefined })}
            />
            {bottle.labelColor && (
              <input type="color" value={bottle.labelColor} onChange={(e) => update({ labelColor: e.target.value })} className="h-8 w-12 cursor-pointer rounded-sm border border-line bg-card" />
            )}
          </span>
        </label>
        <div className="col-span-2 flex items-center gap-3 pt-1">
          <Button size="sm" onClick={save} isLoading={saving}>Save bottle</Button>
          {error && <span className="text-sm text-alert">{error}</span>}
        </div>
      </div>
    </div>
  );
}

/** Editable sheet used on the private shelf page. */
export function ShelfPerfumeSheet({ item, onRemoved }: { item: ShelfPerfume; onRemoved: () => void }) {
  const [status, setStatus] = useState<ShelfStatus>(item.status);
  const [size, setSize] = useState(item.sizeMl?.toString() ?? "");
  const [rating, setRating] = useState<number | null>(item.rating ?? null);
  const [favorite, setFavorite] = useState(item.favorite);
  const [notes, setNotes] = useState(item.privateNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [editingBottle, setEditingBottle] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const dirty =
    status !== item.status ||
    size !== (item.sizeMl?.toString() ?? "") ||
    rating !== (item.rating ?? null) ||
    favorite !== item.favorite ||
    notes !== item.privateNotes;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateShelfItem(item.id, {
        status,
        sizeMl: size.trim() === "" ? null : Number(size),
        rating,
        favorite,
        privateNotes: notes,
      });
      setMessage({ tone: "info", text: "Saved." });
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Couldn't save." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await removeShelfItem(item.id);
      onRemoved();
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "Couldn't remove." });
      setSaving(false);
    }
  };

  const query = encodeURIComponent(`${item.name} by ${item.brand}`);
  const field = "w-full rounded-sm border border-line bg-card px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <Header item={{ ...item, status, rating: rating ?? undefined, favorite }} />

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link className="link" href={`/discover?mode=details&q=${query}`}>Full breakdown</Link>
        <Link className="link" href={`/discover?mode=similar&q=${query}`}>Find similar</Link>
        <Link className="link" href={`/builder?mode=inspired&q=${query}`}>Compose inspired by it</Link>
      </div>

      <section className="space-y-4 rounded-sm border border-line bg-card p-4">
        <p className="eyebrow">Your bottle</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-ink-soft">Status</span>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as ShelfStatus)}>
              {SHELF_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-ink-soft">Size (ml)</span>
            <input className={field} type="number" min={0.1} max={5000} step="0.1" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 100" />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
            <span className="mr-2 text-ink-soft">Rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setRating(rating === n ? null : n)}
                className={`cursor-pointer text-xl leading-none ${rating && n <= rating ? "text-resin" : "text-line-strong hover:text-resin/60"}`}
              >
                ★
              </button>
            ))}
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
            Favorite
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-ink-soft">Private notes <span className="text-ink-faint">(never shown publicly)</span></span>
          <textarea
            className={`${field} min-h-24 resize-y`}
            value={notes}
            maxLength={LIMITS.privateNotes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where you bought it, how it wears on you, occasions…"
          />
        </label>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={save} disabled={!dirty} isLoading={saving}>Save changes</Button>
          {message && <span className={`text-sm ${message.tone === "error" ? "text-alert" : "text-moss"}`}>{message.text}</span>}
        </div>
      </section>

      <Breakdown item={item} />

      <section className="space-y-3 border-t border-line pt-6">
        <p className="eyebrow">Bottle photo</p>
        <PhotoManager item={item} />
      </section>

      <section className="space-y-3 border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">Bottle illustration</p>
          <button className="link cursor-pointer text-sm" onClick={() => setEditingBottle((v) => !v)}>
            {editingBottle ? "Close editor" : "Edit bottle"}
          </button>
        </div>
        {!editingBottle && item.bottle.accuracy !== "known" && (
          <p className="text-sm text-ink-faint">
            {item.bottle.accuracy === "generic"
              ? "This is a generic bottle — edit it to match yours."
              : "Drawn from the AI's best guess — edit it if it doesn't match your bottle."}
          </p>
        )}
        {editingBottle && <BottleEditor item={item} onSaved={() => setEditingBottle(false)} />}
      </section>

      <section className="border-t border-line pt-6">
        {confirmRemove ? (
          <Notice tone="warning" title={`Remove ${item.name} from your shelf?`}>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={remove} isLoading={saving}>Remove</Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            </div>
          </Notice>
        ) : (
          <button className="cursor-pointer text-sm text-alert hover:underline" onClick={() => setConfirmRemove(true)}>
            Remove from shelf
          </button>
        )}
      </section>
    </div>
  );
}
