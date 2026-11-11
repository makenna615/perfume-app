"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Material } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Notice from "@/components/ui/Notice";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { LAYER_DOT, LAYER_LABEL } from "@/components/ui/Tag";
import MaterialDetail from "@/components/features/ingredients/MaterialDetail";
import { useSearchIngredients } from "@/lib/hooks/useSearchIngredients";
import { COST_LABEL, capitalize } from "@/lib/format";

const SUGGESTIONS = [
  { label: "Iso E Super", hint: "material" },
  { label: "white musk", hint: "note" },
  { label: "ocean", hint: "note" },
  { label: "orris", hint: "material" },
  { label: "oud", hint: "note" },
  { label: "vanilla", hint: "material" },
  { label: "lily of the valley", hint: "note" },
  { label: "Ambroxan", hint: "material" },
];

export default function MaterialsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<Material | null>(null);
  const { search, result, loading, error } = useSearchIngredients();
  const lastRun = useRef<string | null>(null);

  const run = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      lastRun.current = trimmed;
      router.replace(`${pathname}?q=${encodeURIComponent(trimmed)}`, { scroll: false });
      void search(trimmed);
    },
    [pathname, router, search]
  );

  // Follow ?q= changes (initial load and links from inside the drawer).
  const [urlQuery, setUrlQuery] = useState<string | null>(null);
  if (initialQuery && initialQuery !== urlQuery) {
    setUrlQuery(initialQuery);
    setQuery(initialQuery);
    setSelected(null);
  }

  useEffect(() => {
    if (urlQuery && urlQuery !== lastRun.current) {
      run(urlQuery);
    }
  }, [urlQuery, run]);

  const closeDrawer = useCallback(() => setSelected(null), []);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(query);
        }}
        className="mt-10 space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Input
            label="A material, note or family"
            placeholder="Iso E Super, white musk, ocean…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={400}
            autoComplete="off"
          />
          <Button type="submit" size="lg" disabled={!query.trim()} isLoading={loading}>
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-faint">Popular</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setQuery(s.label);
                run(s.label);
              }}
              className="cursor-pointer rounded-full border border-line px-3 py-1 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {s.label}
              <span className="ml-1.5 text-xs text-ink-faint">{s.hint}</span>
            </button>
          ))}
        </div>
      </form>

      <section className="mt-14" aria-live="polite">
        {loading && <Loader label="Consulting the materials library…" />}
        {!loading && error && <Notice tone="error">{error}</Notice>}

        {!loading && !error && result && (
          result.materials.length > 0 ? (
            <div className="animate-rise">
              {result.interpretation && (
                <p className="mb-6 max-w-3xl font-display text-2xl italic leading-snug text-ink-soft">
                  {result.interpretation}
                </p>
              )}
              <ul className="divide-y divide-line border-y border-line">
                {result.materials.map((material) => (
                  <li key={material.id}>
                    <button
                      onClick={() => setSelected(material)}
                      className="group grid w-full cursor-pointer gap-3 py-5 text-left sm:grid-cols-[1fr_9rem_9rem_3rem] sm:items-center sm:gap-6"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-3xl leading-tight transition-colors group-hover:text-resin">
                          {material.name}
                        </span>
                        <span className="mt-1 block truncate text-sm text-ink-soft">
                          {material.scentProfile.slice(0, 4).join(", ")}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-sm text-ink-soft">
                        <span className={`h-2 w-2 rounded-full ${LAYER_DOT[material.role]}`} />
                        {LAYER_LABEL[material.role]} · {capitalize(material.type)}
                      </span>
                      <span className="tabular text-sm text-ink-soft">{material.typicalUsage ?? "—"}</span>
                      <span className="text-sm text-ink-faint sm:text-right">
                        {material.costTier ? COST_LABEL[material.costTier].symbol : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              title="No materials found"
              description="Try a material name (“Hedione”), a note (“fig”) or a family (“ambery”)."
            />
          )
        )}

        {!loading && !result && !error && (
          <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
            {[
              ["Notes aren’t materials", "“White musk”, “sea breeze” and “cashmere” are descriptions. Search them to see the molecules perfumers actually use."],
              ["Dose matters", "Calone works at a fraction of a percent; Hedione at thirty. Each profile gives realistic usage levels."],
              ["Safety first", "Phototoxic citrus, restricted mosses and declarable allergens are flagged so you can follow IFRA guidance."],
            ].map(([title, body]) => (
              <div key={title} className="bg-card p-6">
                <p className="font-display text-2xl">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(selected)}
        onClose={closeDrawer}
        title={selected?.name ?? ""}
        subtitle={selected?.otherNames[0]}
      >
        {selected && <MaterialDetail material={selected} />}
      </Modal>
    </>
  );
}
