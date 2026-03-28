"use client";

import { Formula } from "@/types";

interface ScentPyramidProps {
  formula: Formula;
}

export default function ScentPyramid({ formula }: ScentPyramidProps) {
  const hasRoleMetadata = formula.ingredients.some((ing) => !!ing.role);

  // Prefer role metadata from AI output. Fallback to percentage buckets for older formulas.
  const topIngs = formula.ingredients.filter((ing) => {
    return hasRoleMetadata ? ing.role === "top" : ing.percentage <= 5;
  });

  const middleIngs = formula.ingredients.filter((ing) => {
    return hasRoleMetadata
      ? ing.role === "middle"
      : ing.percentage > 5 && ing.percentage <= 15;
  });

  const baseIngs = formula.ingredients.filter((ing) => {
    return hasRoleMetadata ? ing.role === "base" : ing.percentage > 15;
  });

  const topPercentage = topIngs.reduce((sum, ing) => sum + ing.percentage, 0);
  const middlePercentage = middleIngs.reduce((sum, ing) => sum + ing.percentage, 0);
  const basePercentage = baseIngs.reduce((sum, ing) => sum + ing.percentage, 0);

  return (
    <div className="w-full">
      <div className="bg-gradient-to-b from-perfume-accent/5 via-perfume-surface/30 to-perfume-surface rounded-lg p-8 border border-slate-700">
        <h3 className="text-lg font-bold text-pale-blue mb-6 text-center">🔼 Scent Pyramid</h3>

        {/* Pyramid */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Top Notes */}
          <div className="w-full max-w-xs">
            <div
              className="bg-gradient-to-r from-pale-blue to-perfume-accent rounded-lg p-4 text-center border border-pale-blue/50 shadow-lg shadow-pale-blue/20"
              style={{ width: `${Math.max(30, topPercentage * 2)}%`, margin: "0 auto" }}
            >
              <p className="text-xs font-semibold text-white uppercase mb-1">Top Notes</p>
              <p className="text-lg font-bold text-white">{topPercentage.toFixed(1)}%</p>
              <p className="text-xs text-pale-blue/80">5-15 minutes</p>
            </div>
          </div>

          {/* Middle Notes */}
          <div className="w-full max-w-md">
            <div
              className="bg-gradient-to-r from-pale-purple to-perfume-accent rounded-lg p-5 text-center border border-pale-purple/50 shadow-lg shadow-pale-purple/20"
              style={{ width: `${Math.max(50, middlePercentage * 1.5)}%`, margin: "0 auto" }}
            >
              <p className="text-xs font-semibold text-white uppercase mb-1">Heart Notes</p>
              <p className="text-lg font-bold text-white">{middlePercentage.toFixed(1)}%</p>
              <p className="text-xs text-pale-purple/80">30-60 minutes</p>
            </div>
          </div>

          {/* Base Notes */}
          <div className="w-full">
            <div
              className="bg-gradient-to-r from-pale-green to-perfume-accent rounded-lg p-6 text-center border border-pale-green/50 shadow-lg shadow-pale-green/20"
              style={{ width: `${Math.max(70, basePercentage)}%`, margin: "0 auto" }}
            >
              <p className="text-xs font-semibold text-white uppercase mb-1">Base Notes</p>
              <p className="text-lg font-bold text-white">{basePercentage.toFixed(1)}%</p>
              <p className="text-xs text-pale-green/80">2-8+ hours</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-pale-blue/70 mb-1">Top Ingredients</p>
            <div className="space-y-1">
              {topIngs.slice(0, 2).map((ing, idx) => (
                <p key={`top-${idx}`} className="text-xs text-pale-blue font-medium">
                  {ing.ingredientName}
                </p>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-pale-purple/70 mb-1">Heart Ingredients</p>
            <div className="space-y-1">
              {middleIngs.slice(0, 2).map((ing, idx) => (
                <p key={`mid-${idx}`} className="text-xs text-pale-purple font-medium">
                  {ing.ingredientName}
                </p>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-pale-green/70 mb-1">Base Ingredients</p>
            <div className="space-y-1">
              {baseIngs.slice(0, 2).map((ing, idx) => (
                <p key={`base-${idx}`} className="text-xs text-pale-green font-medium">
                  {ing.ingredientName}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
