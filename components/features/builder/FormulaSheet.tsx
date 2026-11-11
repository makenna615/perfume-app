"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type { Formula, NoteRole } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { LAYER_DOT, LAYER_LABEL } from "@/components/ui/Tag";
import NotePyramid from "@/components/features/NotePyramid";
import { COST_LABEL, fmt } from "@/lib/format";

const PRODUCT_TYPES = [
  { id: "edc", label: "Cologne", percent: 4 },
  { id: "edt", label: "Eau de Toilette", percent: 10 },
  { id: "edp", label: "Eau de Parfum", percent: 18 },
  { id: "extrait", label: "Extrait", percent: 25 },
] as const;

const VOLUMES = [10, 30, 50, 100];
const ROLES: NoteRole[] = ["top", "middle", "base"];

function defaultConcentration(formula: Formula): number {
  const recommended = formula.recommendedConcentration?.percent;
  return recommended && recommended >= 2 && recommended <= 35 ? recommended : 18;
}

function formulaAsText(formula: Formula, volume: number, concentration: number): string {
  const concentrate = (volume * concentration) / 100;
  const lines = [
    formula.name,
    formula.olfactiveFamily ? `${formula.olfactiveFamily}` : "",
    formula.description ?? "",
    "",
    `Batch: ${volume} ml at ${concentration}% → ${fmt(concentrate)} ml concentrate + ${fmt(volume - concentrate)} ml perfumer's alcohol`,
    "",
    "Role   | Material | % of concentrate | Amount",
    ...formula.ingredients.map((ing) => {
      const amount = (concentrate * ing.percentage) / 100;
      const dilution = ing.dilution && ing.dilution !== "100%" ? ` @${ing.dilution}` : "";
      return `${LAYER_LABEL[ing.role ?? "middle"].padEnd(6)} | ${ing.ingredientName}${dilution} | ${fmt(ing.percentage, 1)}% | ${fmt(amount)} ml`;
    }),
    "",
    formula.maceration ? `Maceration: ${formula.maceration}` : "",
    ...formula.tips.map((tip) => `• ${tip}`),
  ];
  return lines.filter((line, i, arr) => line !== "" || arr[i - 1] !== "").join("\n").trim();
}

interface FormulaSheetProps {
  formula: Formula;
  saved: boolean;
  onSave: () => void;
}

export default function FormulaSheet({ formula, saved, onSave }: FormulaSheetProps) {
  const [volume, setVolume] = useState(50);
  const [concentration, setConcentration] = useState(() => defaultConcentration(formula));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const concentrate = (volume * concentration) / 100;
  const alcohol = volume - concentrate;

  const layerShare = useMemo(() => {
    const share: Record<NoteRole, number> = { top: 0, middle: 0, base: 0 };
    for (const ing of formula.ingredients) share[ing.role ?? "middle"] += ing.percentage;
    return share;
  }, [formula.ingredients]);

  const hasDilutions = formula.ingredients.some((ing) => ing.dilution && ing.dilution !== "100%");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formulaAsText(formula, volume, concentration));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — nothing else to do
    }
  };

  return (
    <article className="animate-rise">
      {/* Title block */}
      <header className="grid gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow mb-2">
            {formula.olfactiveFamily ?? "Formula"}
            {formula.optimizationMode && formula.optimizationMode !== "balanced" && ` · tuned for ${formula.optimizationMode}`}
          </p>
          <h2 className="text-5xl sm:text-6xl">{formula.name}</h2>
          {formula.concept && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{formula.concept}</p>}
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? "Copied" : "Copy formula"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button size="sm" onClick={onSave} disabled={saved}>
            {saved ? "Saved to notebook" : "Save to notebook"}
          </Button>
        </div>
      </header>

      {formula.warnings.length > 0 && (
        <div className="mt-6">
          <Notice tone="warning" title="Before you mix">
            <ul className="list-disc space-y-1 pl-4">
              {formula.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      {/* Evolution */}
      {formula.timeline && (
        <section className="mt-10">
          <h3 className="mb-4 text-3xl">How it unfolds</h3>
          <ol className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
            {(
              [
                ["top", "Opening", formula.timeline.opening],
                ["middle", "Heart", formula.timeline.heart],
                ["base", "Dry-down", formula.timeline.drydown],
              ] as const
            ).map(([role, label, text]) => (
              <li key={role} className="bg-card p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <span className={`h-2 w-2 rounded-full ${LAYER_DOT[role]}`} />
                  {label}
                </p>
                <p className="leading-relaxed text-ink-soft">{text ?? "—"}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Batch calculator + table */}
      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-6">
          <h3 className="text-3xl">The formula</h3>
          <div className="flex flex-wrap gap-6 print:hidden">
            <fieldset>
              <legend className="eyebrow mb-2">Strength</legend>
              <div className="flex flex-wrap gap-1">
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setConcentration(type.percent)}
                    aria-pressed={concentration === type.percent}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      concentration === type.percent ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
                <label className="ml-1 flex items-center gap-1 text-sm text-ink-soft">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={concentration}
                    onChange={(e) => setConcentration(Math.min(40, Math.max(1, Number(e.target.value) || 1)))}
                    className="tabular w-14 rounded-sm border border-line bg-card px-2 py-1 text-right"
                    aria-label="Concentration percent"
                  />
                  %
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow mb-2">Bottle</legend>
              <div className="flex flex-wrap gap-1">
                {VOLUMES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVolume(v)}
                    aria-pressed={volume === v}
                    className={`tabular cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      volume === v ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                    }`}
                  >
                    {v} ml
                  </button>
                ))}
                <label className="ml-1 flex items-center gap-1 text-sm text-ink-soft">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={volume}
                    onChange={(e) => setVolume(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                    className="tabular w-16 rounded-sm border border-line bg-card px-2 py-1 text-right"
                    aria-label="Bottle volume in ml"
                  />
                  ml
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Layer balance */}
        <div className="mb-6">
          <div className="flex h-2.5 overflow-hidden rounded-full" aria-hidden>
            {ROLES.map((role) => (
              <span key={role} className={LAYER_DOT[role]} style={{ width: `${layerShare[role]}%` }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
            {ROLES.map((role) => (
              <span key={role} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${LAYER_DOT[role]}`} />
                {LAYER_LABEL[role]} <span className="tabular text-ink">{fmt(layerShare[role], 1)}%</span>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-sm border border-line bg-card">
          <table className="w-full min-w-[38rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="eyebrow px-4 py-3 font-semibold">Material</th>
                <th className="eyebrow px-4 py-3 text-right font-semibold">% of concentrate</th>
                <th className="eyebrow px-4 py-3 text-right font-semibold">Amount</th>
                <th className="eyebrow px-4 py-3 text-right font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {formula.ingredients.map((ing) => {
                const role = ing.role ?? "middle";
                const amount = (concentrate * ing.percentage) / 100;
                const isOpen = expanded === ing.ingredientId;
                return (
                  <Fragment key={ing.ingredientId}>
                    <tr
                      className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-paper/70"
                      onClick={() => setExpanded(isOpen ? null : ing.ingredientId)}
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${LAYER_DOT[role]}`} title={`${LAYER_LABEL[role]} note`} />
                          <span>
                            <span className="font-medium text-ink">{ing.ingredientName}</span>
                            {ing.dilution && ing.dilution !== "100%" && (
                              <span className="ml-2 text-xs text-ink-faint">at {ing.dilution}</span>
                            )}
                            {ing.safetyNote && (
                              <span className="ml-2 text-xs text-alert" title={ing.safetyNote}>
                                ⚠ safety
                              </span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className="tabular px-4 py-3 text-right">{fmt(ing.percentage, 1)}%</td>
                      <td className="tabular px-4 py-3 text-right">{fmt(amount)} ml</td>
                      <td className="px-4 py-3 text-right text-ink-faint" title={ing.costTier ? COST_LABEL[ing.costTier].label : undefined}>
                        {ing.costTier ? COST_LABEL[ing.costTier].symbol : "—"}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-line/70 bg-paper/60">
                        <td colSpan={4} className="px-4 pb-4 pl-9 pt-1 text-ink-soft">
                          {ing.reason && <p className="leading-relaxed">{ing.reason}</p>}
                          {ing.safetyNote && <p className="mt-2 text-alert">{ing.safetyNote}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {ing.substitutes && ing.substitutes.length > 0 && (
                              <span>
                                <span className="text-ink-faint">Swap for: </span>
                                {ing.substitutes.join(", ")}
                              </span>
                            )}
                            <Link
                              href={`/ingredients?q=${encodeURIComponent(ing.ingredientName)}`}
                              className="link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Material profile →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line-strong">
                <td className="px-4 py-3 font-medium">Perfume concentrate</td>
                <td className="tabular px-4 py-3 text-right">100%</td>
                <td className="tabular px-4 py-3 text-right font-medium">{fmt(concentrate)} ml</td>
                <td />
              </tr>
              <tr>
                <td className="px-4 pb-3 text-ink-soft">+ Perfumer’s alcohol</td>
                <td />
                <td className="tabular px-4 pb-3 text-right text-ink-soft">{fmt(alcohol)} ml</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Amounts are by volume; for most materials 1 ml ≈ 1 g, and perfumers prefer weighing on a 0.01 g scale.
          {hasDilutions && " Materials marked “at 10%” or “at 1%” are weighed as pre-made dilutions, so the true strength is slightly lower than shown."}{" "}
          Select a row to see why it’s there.
        </p>
      </section>

      {/* Reference & extras */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {formula.reference && (
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-2xl">
                Reference: {formula.reference.name}
                {formula.reference.brand && <span className="text-ink-faint"> by {formula.reference.brand}</span>}
              </h3>
              {formula.reference.confidence && formula.reference.confidence !== "high" && (
                <span className="text-xs text-ink-faint">{formula.reference.confidence} confidence — verify the notes</span>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <NotePyramid notes={formula.reference.notes} />
              {formula.keyDifferences && formula.keyDifferences.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">How this formula differs</p>
                  <ul className="space-y-2 text-ink-soft">
                    {formula.keyDifferences.map((d) => (
                      <li key={d} className="border-l-2 border-resin pl-3 leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {formula.suggestedAdditions && formula.suggestedAdditions.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-2xl">Worth adding</h3>
            <ul className="space-y-3">
              {formula.suggestedAdditions.map((s) => (
                <li key={s.name} className="text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    {s.role && <span className={`h-2 w-2 rounded-full ${LAYER_DOT[s.role]}`} />}
                    {s.name}
                  </span>
                  {s.why && <span className="mt-0.5 block text-ink-soft">{s.why}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(formula.maceration || formula.recommendedConcentration) && (
          <Card className="p-5">
            <h3 className="mb-3 text-2xl">Dilute &amp; rest</h3>
            {formula.recommendedConcentration && (
              <p className="text-sm leading-relaxed text-ink-soft">
                <span className="font-medium text-ink">
                  {formula.recommendedConcentration.type} at {formula.recommendedConcentration.percent}%.
                </span>{" "}
                {formula.recommendedConcentration.why}
              </p>
            )}
            {formula.maceration && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{formula.maceration}</p>}
          </Card>
        )}

        {formula.tips.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-2xl">At the bench</h3>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-soft">
              {formula.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="text-resin">—</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {formula.description && (
        <p className="mt-10 border-t border-line pt-6 font-display text-2xl italic leading-snug text-ink-soft">
          “{formula.description}”
        </p>
      )}
    </article>
  );
}
