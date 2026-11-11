import Link from "next/link";
import type { PerfumeIntelligenceResponse } from "@/types";
import AccordBars from "@/components/features/AccordBars";
import NotePyramid from "@/components/features/NotePyramid";
import Tag from "@/components/ui/Tag";
import Card from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { PRICE_TIER_LABEL, capitalize } from "@/lib/format";

const LONGEVITY_STEPS = ["poor", "moderate", "long-lasting", "very long-lasting"] as const;
const SILLAGE_STEPS = ["soft", "moderate", "strong", "enormous"] as const;

function Scale({ label, steps, value }: { label: string; steps: readonly string[]; value: string }) {
  const index = steps.indexOf(value);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="capitalize">{value}</span>
      </div>
      <div className="grid grid-cols-4 gap-1" aria-hidden>
        {steps.map((step, i) => (
          <span key={step} className={`h-1.5 rounded-full ${i <= index ? "bg-ink" : "bg-paper-deep"}`} />
        ))}
      </div>
    </div>
  );
}

interface PerfumeDetailsProps {
  data: PerfumeIntelligenceResponse;
  onSelect: (name: string, brand: string) => void;
}

export default function PerfumeDetails({ data, onSelect }: PerfumeDetailsProps) {
  const perfume = data.perfume!;
  const meta = [
    perfume.concentration,
    perfume.releaseYear?.toString(),
    perfume.gender ? `Marketed ${perfume.gender === "unisex" ? "as unisex" : `for ${perfume.gender === "male" ? "men" : "women"}`}` : undefined,
  ].filter(Boolean);

  return (
    <article className="animate-rise">
      <header className="grid gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow mb-2">{perfume.brand}</p>
          <h2 className="text-5xl sm:text-6xl">{perfume.name}</h2>
          {meta.length > 0 && <p className="mt-3 text-ink-soft">{meta.join(" · ")}</p>}
          {perfume.perfumers.length > 0 && (
            <p className="mt-1 text-sm text-ink-faint">Perfumer{perfume.perfumers.length > 1 ? "s" : ""}: {perfume.perfumers.join(", ")}</p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {perfume.community && (
            <p className="text-sm text-ink-soft">
              <span className="tabular text-2xl text-ink">{perfume.community.rating.toFixed(2)}</span>
              <span className="text-ink-faint"> / 5 · {perfume.community.reviewsCount.toLocaleString()} votes on Fragrantica</span>
            </p>
          )}
          <span className="text-xs text-ink-faint">
            {perfume.source === "fragrantica" ? (
              <>
                Notes from{" "}
                <a className="link" href={perfume.sourceUrl} target="_blank" rel="noreferrer">
                  Fragrantica
                </a>
              </>
            ) : (
              <>Notes from AI knowledge ({data.confidence} confidence) — verify before relying on them</>
            )}
          </span>
        </div>
      </header>

      {data.alternatives.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>Other perfumes with this name:</span>
          {data.alternatives.map((alt) => (
            <button
              key={`${alt.name}-${alt.brand}`}
              onClick={() => onSelect(alt.name, alt.brand)}
              className="cursor-pointer rounded-full border border-line px-3 py-1 hover:border-ink"
            >
              {alt.name} <span className="text-ink-faint">by {alt.brand}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <section>
          {perfume.fragranceFamily && <p className="font-display text-2xl italic text-resin">{perfume.fragranceFamily}</p>}
          {perfume.description && <p className="mt-3 text-lg leading-relaxed text-ink-soft">{perfume.description}</p>}

          <h3 className="mb-4 mt-10 text-3xl">Notes</h3>
          <NotePyramid notes={perfume.notes} structure={perfume.notesStructure} linkNotes />
          <p className="mt-3 text-xs text-ink-faint">Select a note to see which raw materials are used to create it.</p>
        </section>

        <aside className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-4 text-2xl">Accords</h3>
            <AccordBars accords={perfume.accords} />
          </Card>

          {perfume.performance && (
            <Card className="space-y-4 p-5">
              <h3 className="text-2xl">Performance</h3>
              <Scale label="Longevity" steps={LONGEVITY_STEPS} value={perfume.performance.longevity} />
              <Scale label="Sillage" steps={SILLAGE_STEPS} value={perfume.performance.sillage} />
              <p className="text-xs text-ink-faint">Typical community consensus — skin chemistry varies.</p>
            </Card>
          )}

          {(perfume.seasons.length > 0 || perfume.occasions.length > 0 || perfume.priceTier) && (
            <Card className="space-y-3 p-5">
              <h3 className="text-2xl">When to wear</h3>
              <div className="flex flex-wrap gap-1.5">
                {perfume.seasons.map((s) => (
                  <Tag key={s}>{capitalize(s)}</Tag>
                ))}
                {perfume.occasions.map((o) => (
                  <Tag key={o} tone="resin">
                    {capitalize(o)}
                  </Tag>
                ))}
              </div>
              {perfume.priceTier && <p className="text-sm text-ink-soft">Price tier: {PRICE_TIER_LABEL[perfume.priceTier]}</p>}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="mb-3 text-2xl">Find it</h3>
            <ul className="divide-y divide-line">
              {perfume.availability.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between py-2.5 text-sm">
                    <span>
                      {item.store}
                      <span className="block text-xs text-ink-faint">{item.region}</span>
                    </span>
                    <span className="text-ink-faint transition-transform group-hover:translate-x-0.5">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Link
            href={`/builder?mode=inspired&q=${encodeURIComponent(`${perfume.name} by ${perfume.brand}`)}`}
            className={buttonClass("primary", "lg", "w-full")}
          >
            Compose a formula inspired by it
          </Link>
        </aside>
      </div>
    </article>
  );
}
