import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DiscoverView from "@/components/features/discover/DiscoverView";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        numeral="I"
        eyebrow="Discover"
        title={
          <>
            Find your next <em className="text-resin">signature</em>
          </>
        }
        intro="Look up a perfume’s real note pyramid, find others that share its DNA, or search by the notes you can’t get enough of."
      />
      <Suspense fallback={null}>
        <DiscoverView />
      </Suspense>
    </div>
  );
}
