"use client";

import { useState } from "react";
import { Formula } from "@/types";
import Button from "@/components/ui/Button";

interface FormulaScalerProps {
  formula: Formula;
  baseVolume?: number;
}

export default function FormulaScaler({
  formula,
  baseVolume = 50,
}: FormulaScalerProps) {
  const [desiredVolume, setDesiredVolume] = useState(baseVolume);
  const [showScaledRecipe, setShowScaledRecipe] = useState(false);

  const scaleFactor = desiredVolume / baseVolume;
  const totalPercentage = formula.ingredients.reduce(
    (sum, ing) => sum + ing.percentage,
    0
  );

  const estimatedCost = formula.ingredients.reduce((sum, ing) => {
    const cost = ing.percentage * 0.5;
    return sum + cost * scaleFactor;
  }, 0);

  const commonVolumes = [25, 50, 100, 250];

  return (
    <div className="space-y-6">
      <div className="bg-perfume-surface/50 rounded-lg p-6 border border-slate-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-perfume-accent mb-2">
              Desired Volume (ml)
            </label>
            <div className="flex gap-2 mb-4">
              {commonVolumes.map((vol) => (
                <button
                  key={vol}
                  onClick={() => setDesiredVolume(vol)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    desiredVolume === vol
                      ? "bg-perfume-accent text-white shadow-lg"
                      : "bg-slate-800 text-pale-purple hover:bg-slate-700"
                  }`}
                >
                  {vol}ml
                </button>
              ))}
            </div>
            <input
              type="number"
              value={desiredVolume}
              onChange={(e) => setDesiredVolume(Math.max(5, Number(e.target.value)))}
              min="5"
              max="500"
              className="w-full px-4 py-2 rounded-lg bg-perfume-surface border border-slate-700 text-white focus:border-perfume-accent focus:ring-2 focus:ring-perfume-accent/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
            <div>
              <p className="text-xs text-pale-purple/60 mb-1">Scale Factor</p>
              <p className="text-xl font-bold text-pale-blue">{scaleFactor.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-pale-purple/60 mb-1">Est. Cost</p>
              <p className="text-xl font-bold text-pale-green">${estimatedCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-pale-purple/60 mb-1">Fragrance Oil Needed</p>
              <p className="text-lg font-bold text-perfume-accent">
                {((totalPercentage * desiredVolume) / 100).toFixed(1)}ml
              </p>
            </div>
            <div>
              <p className="text-xs text-pale-purple/60 mb-1">Carrier Base Needed</p>
              <p className="text-lg font-bold text-pale-purple">
                {(((100 - totalPercentage) * desiredVolume) / 100).toFixed(1)}ml
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowScaledRecipe(!showScaledRecipe);
            }}
            variant="secondary"
            className="w-full"
          >
            {showScaledRecipe ? "Hide Scaled Recipe" : "View Scaled Recipe"}
          </Button>

          {showScaledRecipe && (
            <div className="bg-pale-blue/10 border border-pale-blue/30 rounded-lg p-3 text-sm text-pale-blue">
              <p className="font-semibold mb-1">Scaled Recipe ({desiredVolume}ml)</p>
              <ul className="space-y-1 text-xs">
                {formula.ingredients.map((ing, idx) => (
                  <li key={`ing-${idx}`} className="flex justify-between">
                    <span>{ing.ingredientName}</span>
                    <span className="font-semibold">
                      {((ing.percentage * desiredVolume) / 100).toFixed(2)}ml
                      <span className="text-pale-blue/60"> ({ing.percentage}%)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
