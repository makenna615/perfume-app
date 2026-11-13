"use client";

import Link from "next/link";
import type { SimilarSearchResult } from "@/types";
import Tag from "@/components/ui/Tag";
import { PRICE_TIER_LABEL, RELATIONSHIP_LABEL } from "@/lib/format";
import { useShelf } from "@/lib/hooks/useShelf";

interface SimilarResultsProps {
  result: SimilarSearchResult;
  mode: "similar" | "notes";
  onViewDetails: (name: string, brand: string) => void;
}

export default function SimilarResults({ result, mode, onViewDetails }: SimilarResultsProps) {
  const shelf = useShelf();
  const { reference, results } = result;

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14">
      {reference && (
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-3">{mode === "notes" ? "You asked for" : result.found ? "Reference" : "We couldn’t identify that perfume"}</p>
          <h2 className="text-4xl">{reference.name}</h2>
          {reference.brand && (
            <p className="mt-1 text-ink-soft">
              {reference.brand}
              {reference.concentration && <span className="text-ink-faint"> · {reference.concentration}</span>}
              {reference.releaseYear && <span className="text-ink-faint"> · {reference.releaseYear}</span>}
            </p>
          )}
          {reference.fragranceFamily && (
            <p className="mt-4 font-display text-xl italic text-resin">{reference.fragranceFamily}</p>
          )}
          {reference.character && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{reference.character}</p>}
          {reference.keyNotes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {reference.keyNotes.map((note) => (
                <Tag key={note} tone="resin">
                  {note}
                </Tag>
              ))}
            </div>
          )}
          {mode === "similar" && result.found && (
            <button
              onClick={() => onViewDetails(reference.name, reference.brand)}
              className="link mt-5 cursor-pointer text-sm"
            >
              Full note pyramid →
            </button>
          )}
        </aside>
      )}

      <ol className="divide-y divide-line border-y border-line">
        {results.map((perfume, index) => (
          <li key={perfume.id} className="grid animate-rise gap-4 py-6 sm:grid-cols-[2.5rem_1fr_6.5rem]" style={{ animationDelay: `${index * 60}ms` }}>
            <span className="font-display text-3xl italic text-ink-faint">{String(index + 1).padStart(2, "0")}</span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-3xl">{perfume.name}</h3>
                <span className="text-ink-soft">{perfume.brand}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag tone={perfume.relationship === "dupe" ? "resin" : "neutral"}>{RELATIONSHIP_LABEL[perfume.relationship]}</Tag>
                {shelf.has(perfume.name, perfume.brand) && <Tag tone="base">✓ On your shelf</Tag>}
                {perfume.priceTier && <Tag>{PRICE_TIER_LABEL[perfume.priceTier]}</Tag>}
              </div>

              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{perfume.explanation}</p>
              {perfume.keyDifference && (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-faint">
                  <span className="font-medium text-ink-soft">Difference: </span>
                  {perfume.keyDifference}
                </p>
              )}

              {perfume.sharedNotes.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="eyebrow mr-1">{mode === "notes" ? "Features" : "Shared"}</span>
                  {perfume.sharedNotes.map((note) => (
                    <Tag key={note}>{note}</Tag>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <button onClick={() => onViewDetails(perfume.name, perfume.brand)} className="link cursor-pointer">
                  Note pyramid
                </button>
                <Link
                  href={`/builder?mode=inspired&q=${encodeURIComponent(`${perfume.name} by ${perfume.brand}`)}`}
                  className="link"
                >
                  Compose something inspired by it
                </Link>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="tabular text-3xl text-ink">{perfume.matchPercentage}%</p>
              <p className="text-xs text-ink-faint">similarity</p>
              <div className="mt-2 h-1 w-full rounded-full bg-paper-deep">
                <div className="h-1 rounded-full bg-resin" style={{ width: `${perfume.matchPercentage}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
