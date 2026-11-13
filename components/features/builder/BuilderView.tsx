"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BuilderMode, Formula, OptimizationMode } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Segmented from "@/components/ui/Segmented";
import Loader from "@/components/ui/Loader";
import Notice from "@/components/ui/Notice";
import FormulaSheet from "@/components/features/builder/FormulaSheet";
import { useGenerateFormula } from "@/lib/hooks/useGenerateFormula";
import { useNotebook } from "@/lib/hooks/useNotebook";

const MODES: { value: BuilderMode; label: string; hint: string }[] = [
  { value: "vibe", label: "From a memory", hint: "Describe a place, moment or mood" },
  { value: "ingredients", label: "From my shelf", hint: "Use only materials you own" },
  { value: "inspired", label: "Inspired by", hint: "An original take on a perfume" },
];

const OPTIMIZATIONS: { value: OptimizationMode; label: string; hint: string }[] = [
  { value: "balanced", label: "Balanced", hint: "A clear three-act evolution" },
  { value: "longevity", label: "Longevity", hint: "Base-heavy, lasts on skin" },
  { value: "projection", label: "Projection", hint: "Diffusive, fills a room" },
];

const EXAMPLES: Record<BuilderMode, string[]> = {
  vibe: [
    "My grandmother's linen cupboard — lavender, starch and old wood",
    "A rainy pine forest at dusk",
    "Fresh espresso and a cashmere sweater on a winter morning",
  ],
  ingredients: [
    "Bergamot oil FCF, Hedione, Iso E Super, Ambroxan, vanillin, cedarwood oil",
    "Lavender oil, tonka bean absolute, coumarin, patchouli oil, Galaxolide",
  ],
  inspired: ["Le Labo Santal 33", "Guerlain Shalimar", "Maison Margiela Replica Lazy Sunday Morning"],
};

const LOADING_COPY: Record<BuilderMode, string> = {
  vibe: "Translating the memory into materials…",
  ingredients: "Balancing what’s on your shelf…",
  inspired: "Studying the reference and taking a new direction…",
};

function isMode(value: string | null): value is BuilderMode {
  return value === "vibe" || value === "ingredients" || value === "inspired";
}

export default function BuilderView() {
  const params = useSearchParams();
  const initialMode = params.get("mode");
  const [mode, setMode] = useState<BuilderMode>(isMode(initialMode) ? initialMode : "vibe");
  const [input, setInput] = useState(params.get("q") ?? "");
  const [optimization, setOptimization] = useState<OptimizationMode>("balanced");
  const { generate, formula, setFormula, loading, error } = useGenerateFormula();
  const notebook = useNotebook();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    await generate(mode, input, optimization);
  };

  const open = (saved: Formula) => {
    setFormula(saved);
    document.getElementById("formula")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div className="space-y-8">
          <Segmented
            label="Starting point"
            options={MODES}
            value={mode}
            onChange={(value) => {
              setMode(value);
              setInput("");
            }}
          />

          {mode === "inspired" ? (
            <Input
              label="Perfume to take inspiration from"
              placeholder="Le Labo Santal 33"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={400}
            />
          ) : (
            <Textarea
              label={mode === "vibe" ? "The memory or mood" : "Materials you own"}
              placeholder={
                mode === "vibe"
                  ? "Salt on warm skin after a day at the beach…"
                  : "Bergamot oil, Hedione, Iso E Super, vanillin…"
              }
              helperText={
                mode === "vibe"
                  ? "Specific sensory details — places, textures, seasons, times of day — give the best results."
                  : "Separate with commas. Real material names (e.g. “Galaxolide”) work better than notes (“white musk”)."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={400}
              rows={4}
            />
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            {EXAMPLES[mode].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setInput(example)}
                className="cursor-pointer rounded-full border border-line px-3 py-1 text-left text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 lg:border-l lg:border-line lg:pl-10">
          <fieldset>
            <legend className="eyebrow mb-3">Optimise for</legend>
            <div className="space-y-2">
              {OPTIMIZATIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-sm border p-3 transition-colors ${
                    optimization === option.value ? "border-ink bg-card" : "border-line hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="optimization"
                    value={option.value}
                    checked={optimization === option.value}
                    onChange={() => setOptimization(option.value)}
                    className="mt-1 accent-[var(--color-resin)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-ink-faint">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" size="lg" className="w-full" disabled={!input.trim()} isLoading={loading}>
            {loading ? "Composing…" : "Compose formula"}
          </Button>
          <p className="text-xs leading-relaxed text-ink-faint">
            Formulas use real, purchasable materials at realistic levels with IFRA notes. Always test on a smelling strip
            first and check current IFRA limits before applying to skin.
          </p>
        </div>
      </form>

      <section id="formula" className="mt-16 scroll-mt-24">
        {loading && <Loader label={LOADING_COPY[mode]} detail="Good formulas take a moment — usually 15–30 seconds." />}
        {!loading && error && <Notice tone="error">{error}</Notice>}
        {!loading && formula && (
          <FormulaSheet
            key={formula.createdAt ?? formula.id}
            formula={formula}
            saved={notebook.isSaved(formula.id)}
            onSave={() => setFormula(notebook.save(formula))}
          />
        )}
      </section>

      {notebook.formulas.length > 0 && (
        <section className="mt-20 border-t border-line pt-10 print:hidden">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-4xl">Your notebook</h2>
            <span className="text-sm text-ink-faint">Saved in this browser</span>
          </div>
          <ul className="grid overflow-hidden rounded-sm border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {notebook.formulas.map((saved) => (
              <li key={saved.id} className="group relative border-b border-r border-line bg-card p-5">
                <button onClick={() => open(saved)} className="block w-full cursor-pointer text-left">
                  <p className="eyebrow mb-1">{saved.olfactiveFamily ?? "Formula"}</p>
                  <p className="font-display text-2xl leading-tight group-hover:text-resin">{saved.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{saved.input}</p>
                  <p className="mt-3 text-xs text-ink-faint">
                    {saved.ingredients.length} materials
                    {saved.createdAt && ` · ${new Date(saved.createdAt).toLocaleDateString()}`}
                  </p>
                </button>
                <button
                  onClick={() => saved.id && notebook.remove(saved.id)}
                  className="absolute right-3 top-3 cursor-pointer rounded-full px-2 text-ink-faint opacity-0 transition-opacity hover:text-alert group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Delete ${saved.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
