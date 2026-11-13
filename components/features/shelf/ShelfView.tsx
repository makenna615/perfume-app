"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { ShelfPerfume } from "@/types";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import Notice from "@/components/ui/Notice";
import EmptyState from "@/components/ui/EmptyState";
import ShelfBrowser from "@/components/features/shelf/ShelfBrowser";
import AddPerfumePanel from "@/components/features/shelf/AddPerfumePanel";
import { ShelfPerfumeSheet } from "@/components/features/shelf/PerfumeSheet";
import { findPhotoAndRender, useShelf } from "@/lib/hooks/useShelf";
import { SHELF_STATUSES } from "@/lib/shelf/model";

export default function ShelfView() {
  const { items, loading, error, reload } = useShelf();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // Always read the latest copy from the store so edits show up immediately.
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const closeSelected = useCallback(() => setSelectedId(null), []);
  const closeAdd = useCallback(() => setAdding(false), []);

  // Bulk "find photos" for bottles still showing an illustration.
  const [photoRun, setPhotoRun] = useState<{ done: number; total: number; found: number } | null>(null);
  const stopPhotos = useRef(false); // read by the async workers
  const [stopping, setStopping] = useState(false); // mirrors it for rendering
  const missingPhotos = items.filter((i) => !i.photo);
  const findAllPhotos = async () => {
    const queue = missingPhotos.map((i) => i.id);
    stopPhotos.current = false;
    setStopping(false);
    setPhotoRun({ done: 0, total: queue.length, found: 0 });
    let next = 0;
    const worker = async () => {
      while (!stopPhotos.current && next < queue.length) {
        const id = queue[next++];
        const updated = await findPhotoAndRender(id);
        setPhotoRun((r) => (r ? { ...r, done: r.done + 1, found: r.found + (updated?.photo ? 1 : 0) } : r));
      }
    };
    await Promise.all([worker(), worker()]); // two at a time: gentle on brand sites
    setTimeout(() => setPhotoRun(null), 4000);
  };
  const photoRunning = photoRun !== null && photoRun.done < photoRun.total && !stopping;

  const owned = items.filter((i) => i.status !== "wishlist").length;
  const wishlist = items.length - owned;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-soft">
          {loading ? (
            "Loading your shelf…"
          ) : (
            <>
              <span className="tabular text-ink">{owned}</span> perfume{owned === 1 ? "" : "s"}
              {wishlist > 0 && (
                <>
                  {" "}· <span className="tabular text-ink">{wishlist}</span> on your wishlist
                </>
              )}
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {photoRun ? (
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              {photoRunning ? `Finding photos… ${photoRun.done}/${photoRun.total}` : `Found ${photoRun.found} of ${photoRun.total} photos`}
              {photoRunning && (
                <button className="link cursor-pointer" onClick={() => {
                    stopPhotos.current = true;
                    setStopping(true);
                  }}>Stop</button>
              )}
            </span>
          ) : (
            missingPhotos.length > 0 && (
              <Button variant="secondary" onClick={findAllPhotos}>
                Find photos ({missingPhotos.length})
              </Button>
            )
          )}
          <Link href="/collection" className="link text-sm" target="_blank">
            Public view ↗
          </Link>
          <Button onClick={() => setAdding(true)}>Add perfumes</Button>
        </div>
      </div>

      <section className="mt-10">
        {loading && items.length === 0 && <Loader label="Dusting the shelves…" />}
        {error && (
          <Notice tone="error" title="Couldn't load your shelf">
            {error}{" "}
            <button className="link cursor-pointer" onClick={() => void reload()}>Try again</button>
          </Notice>
        )}
        {!loading && !error && items.length === 0 && (
          <EmptyState
            title="Your shelf is empty"
            description="Add the perfumes you own — one at a time, or paste your whole collection as a list. Each one gets its own bottle illustration and note breakdown."
          >
            <Button onClick={() => setAdding(true)}>Add your first perfumes</Button>
          </EmptyState>
        )}
        {items.length > 0 && (
          <ShelfBrowser items={items} statuses={[...SHELF_STATUSES]} onSelect={(item: ShelfPerfume) => setSelectedId(item.id)} />
        )}
      </section>

      <Modal isOpen={adding} onClose={closeAdd} title="Add perfumes">
        <AddPerfumePanel />
      </Modal>

      <Modal isOpen={Boolean(selected)} onClose={closeSelected} title={selected?.name ?? ""} subtitle={selected?.brand}>
        {selected && <ShelfPerfumeSheet key={selected.id} item={selected} onRemoved={closeSelected} />}
      </Modal>
    </>
  );
}
