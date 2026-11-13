"use client";

import { useCallback, useState } from "react";
import type { PublicShelfPerfume, ShelfStatus } from "@/types";
import Modal from "@/components/ui/Modal";
import ShelfBrowser from "@/components/features/shelf/ShelfBrowser";
import { PublicPerfumeSheet } from "@/components/features/shelf/PerfumeSheet";

const PUBLIC_STATUSES: ShelfStatus[] = ["full", "decant", "sample", "finished"];

/** Read-only collection for visitors. Receives only public fields from the server. */
export default function CollectionView({ items }: { items: PublicShelfPerfume[] }) {
  const [selected, setSelected] = useState<PublicShelfPerfume | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <ShelfBrowser items={items} statuses={PUBLIC_STATUSES} onSelect={setSelected} />
      <Modal isOpen={Boolean(selected)} onClose={close} title={selected?.name ?? ""} subtitle={selected?.brand}>
        {selected && <PublicPerfumeSheet item={selected} />}
      </Modal>
    </>
  );
}
