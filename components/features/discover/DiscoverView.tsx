"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Segmented from "@/components/ui/Segmented";
import Loader from "@/components/ui/Loader";
import Notice from "@/components/ui/Notice";
import EmptyState from "@/components/ui/EmptyState";
import SimilarResults from "@/components/features/discover/SimilarResults";
import PerfumeDetails from "@/components/features/discover/PerfumeDetails";
import { useSimilarPerfumes } from "@/lib/hooks/useSimilarPerfumes";
import { usePerfumeIntelligence } from "@/lib/hooks/usePerfumeIntelligence";

type Mode = "similar" | "notes" | "details";

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "similar", label: "Smells like…", hint: "Perfumes with the same DNA" },
  { value: "details", label: "Look up a perfume", hint: "Notes, accords & performance" },
  { value: "notes", label: "Search by notes", hint: "Perfumes built around them" },
];

const COPY: Record<Mode, { label: string; placeholder: string; examples: string[]; loading: string }> = {
  similar: {
    label: "A perfume you love",
    placeholder: "Baccarat Rouge 540",
    examples: ["Baccarat Rouge 540", "Dior Sauvage", "Le Labo Santal 33", "Chanel Coco Mademoiselle"],
    loading: "Comparing scent profiles…",
  },
  details: {
    label: "Perfume name (add “by Brand” to be precise)",
    placeholder: "Terre d’Hermès",
    examples: ["Terre d'Hermès", "Shalimar by Guerlain", "Another 13 by Le Labo", "Tobacco Vanille"],
    loading: "Looking up the note pyramid…",
  },
  notes: {
    label: "Notes, separated by commas",
    placeholder: "fig, coconut, sandalwood",
    examples: ["iris, leather, violet", "fig, cedar, milk", "rose, oud, saffron", "neroli, sea salt, musk"],
    loading: "Finding perfumes built on those notes…",
  },
};

function isMode(value: string | null): value is Mode {
  return value === "similar" || value === "notes" || value === "details";
}

export default function DiscoverView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialMode = params.get("mode");
  const initialQuery = params.get("q") ?? "";

  const [mode, setMode] = useState<Mode>(isMode(initialMode) ? initialMode : "similar");
  const [query, setQuery] = useState(initialQuery);
  const [searchedMode, setSearchedMode] = useState<Mode | null>(null);
  const similar = useSimilarPerfumes();
  const details = usePerfumeIntelligence();
  const ranInitial = useRef(false);

  const run = async (nextMode: Mode, nextQuery: string) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    setSearchedMode(nextMode);
    router.replace(`${pathname}?mode=${nextMode}&q=${encodeURIComponent(trimmed)}`, { scroll: false });
    if (nextMode === "details") {
      await details.search(trimmed).catch(() => undefined);
    } else {
      await similar.search(trimmed, nextMode === "similar" ? "perfume" : "notes");
    }
  };

  // Run a search passed in via the URL (e.g. from another page).
  useEffect(() => {
    if (ranInitial.current || !initialQuery) return;
    ranInitial.current = true;
    void run(isMode(initialMode) ? initialMode : "similar", initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetails = (name: string, brand: string) => {
    const q = brand ? `${name} by ${brand}` : name;
    setMode("details");
    setQuery(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void run("details", q);
  };

  const loading = searchedMode === "details" ? details.loading : similar.loading;
  const error = searchedMode === "details" ? details.error : searchedMode ? similar.error : null;
  const copy = COPY[mode];

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(mode, query);
        }}
        className="mt-10 space-y-8"
      >
        <Segmented label="Search type" options={MODES} value={mode} onChange={setMode} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input
            label={copy.label}
            placeholder={copy.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={400}
            autoComplete="off"
          />
          <Button type="submit" size="lg" disabled={!query.trim()} isLoading={loading} className="sm:mb-0.5">
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-faint">Try</span>
          {copy.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                void run(mode, example);
              }}
              className="cursor-pointer rounded-full border border-line px-3 py-1 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      <section className="mt-14" aria-live="polite">
        {loading && <Loader label={COPY[searchedMode ?? mode].loading} detail="Answers are checked against published note lists where possible." />}

        {!loading && error && <Notice tone="error">{error}</Notice>}

        {!loading && !error && searchedMode && searchedMode !== "details" && similar.result && (
          similar.result.results.length > 0 ? (
            <SimilarResults result={similar.result} mode={searchedMode} onViewDetails={openDetails} />
          ) : (
            <EmptyState
              title="Nothing close enough"
              description="We couldn’t find perfumes we’re confident about. Check the spelling or add the brand."
            />
          )
        )}

        {!loading && !error && searchedMode === "details" && details.result && (
          details.result.found && details.result.perfume ? (
            <PerfumeDetails data={details.result} onSelect={openDetails} />
          ) : (
            <EmptyState
              title={details.result.ambiguous ? "Several perfumes share that name" : "We couldn’t identify that perfume"}
              description={
                details.result.ambiguous
                  ? "Choose the one you mean:"
                  : details.result.suggestions.length
                    ? "Did you mean one of these?"
                    : "Try adding the brand, e.g. “Aventus by Creed”."
              }
            >
              {details.result.suggestions.map((s) => (
                <button
                  key={`${s.name}-${s.brand}`}
                  onClick={() => openDetails(s.name, s.brand)}
                  className="cursor-pointer rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink"
                  title={s.reason}
                >
                  {s.name} <span className="text-ink-faint">by {s.brand}</span>
                </button>
              ))}
            </EmptyState>
          )
        )}

        {!loading && !searchedMode && (
          <EmptyState
            title="Begin with a perfume you know"
            description="Similarity is judged on published note pyramids and accords, then explained — so you can tell a true dupe from a loose cousin."
          />
        )}
      </section>
    </>
  );
}
