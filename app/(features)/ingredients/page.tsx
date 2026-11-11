import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MaterialsView from "@/components/features/ingredients/MaterialsView";

export const metadata: Metadata = { title: "Materials" };

export default function IngredientsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        numeral="III"
        eyebrow="Materials"
        title={
          <>
            What’s really in the <em className="text-resin">bottle</em>
          </>
        }
        intro="Every note is built from raw materials — essential oils, absolutes and aroma molecules. Look one up to learn how it smells, how much to use, and what to watch out for."
      />
      <Suspense fallback={null}>
        <MaterialsView />
      </Suspense>
    </div>
  );
}
