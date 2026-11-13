import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ShelfView from "@/components/features/shelf/ShelfView";

export const metadata: Metadata = { title: "Shelf" };

export default function ShelfPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        numeral="IV"
        eyebrow="Shelf"
        title={
          <>
            Your <em className="text-resin">collection</em>
          </>
        }
        intro="Every bottle you own, drawn as it looks, with its notes a click away. Find similar perfumes or compose something new from any of them."
      />
      <ShelfView />
    </div>
  );
}
