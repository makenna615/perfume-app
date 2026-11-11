import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import BuilderView from "@/components/features/builder/BuilderView";

export const metadata: Metadata = { title: "Compose" };

export default function BuilderPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
      <PageHeader
        numeral="II"
        eyebrow="Compose"
        title={
          <>
            Turn a memory into a <em className="text-resin">formula</em>
          </>
        }
        intro="Describe a moment, list what’s on your shelf, or name a perfume to reinterpret. You’ll get a weighable formula with real materials, a batch calculator and notes on safety."
      />
      <Suspense fallback={null}>
        <BuilderView />
      </Suspense>
    </div>
  );
}
