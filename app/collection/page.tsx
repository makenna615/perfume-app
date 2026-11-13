import type { Metadata } from "next";
import { connection } from "next/server";
import type { PublicShelfPerfume } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import CollectionView from "@/components/features/shelf/CollectionView";
import { listPublicShelf } from "@/lib/shelf/repository";

export const metadata: Metadata = {
  title: "The Collection",
  description: "A perfume collection, bottle by bottle — with note breakdowns for each.",
};

// Public, read-only page. It reads the database directly on the server using an
// allow-listed query (no private notes, sizes or wishlist) — there is no public API.
export default async function CollectionPage() {
  await connection(); // render per request so the collection is always current

  let items: PublicShelfPerfume[] = [];
  let failed = false;
  try {
    items = await listPublicShelf();
  } catch (error) {
    failed = true;
    console.error("Public collection failed to load:", error instanceof Error ? error.message : error);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        numeral="✦"
        eyebrow="The collection"
        title={
          <>
            A shelf of <em className="text-resin">memories</em>
          </>
        }
        intro={
          <>
            {items.length > 0 ? `${items.length} perfumes` : "A perfume collection"}, bottle by bottle. Select one to see
            its note pyramid and accords.
          </>
        }
      />
      <div className="mt-10">
        {failed ? (
          <EmptyState title="The collection is resting" description="It couldn't be loaded right now. Please try again shortly." />
        ) : items.length === 0 ? (
          <EmptyState title="Nothing on the shelf yet" description="Check back soon." />
        ) : (
          <CollectionView items={items} />
        )}
      </div>
    </div>
  );
}
