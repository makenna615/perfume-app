"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";
import FormulaDisplay from "@/components/features/FormulaDisplay";
import { FormulaChart } from "@/components/features/FormulaChart";
import ScentPyramid from "@/components/features/ScentPyramid";
import FormulaScaler from "@/components/features/FormulaScaler";
import BlendingOptimizer from "@/components/features/BlendingOptimizer";
import { useGenerateFormula } from "@/lib/hooks/useGenerateFormula";
import type { OptimizationMode } from "@/lib/ai/prompts";

type BuilderMode = "vibe" | "ingredients" | "inspired";

const modes: {
  id: BuilderMode;
  label: string;
  desc: string;
  placeholder: string;
}[] = [
  {
    id: "vibe",
    label: "Vibe",
    desc: "Describe a mood or scene",
    placeholder: "e.g., rainy forest at night, cozy library in autumn...",
  },
  {
    id: "ingredients",
    label: "Ingredients",
    desc: "Use what you already own",
    placeholder: "e.g., vanilla, ylang-ylang, sandalwood",
  },
  {
    id: "inspired",
    label: "Inspired By",
    desc: "Interpret another fragrance style",
    placeholder: "e.g., Dior Sauvage, Chanel No. 5",
  },
];

export default function BuilderPage() {
  const [mode, setMode] = useState<BuilderMode>("vibe");
  const [input, setInput] = useState("");
  const [optimizationMode, setOptimizationMode] =
    useState<OptimizationMode>("balanced");
  const { generate, formula, loading, error } = useGenerateFormula();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    await generate(mode, input, optimizationMode);
  };

  const currentMode = modes.find((modeItem) => modeItem.id === mode) ?? modes[0];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pale-purple via-perfume-accent to-pale-green bg-clip-text text-transparent mb-4">
            DIY Perfume Builder
          </h1>
          <p className="text-pale-purple/80 text-lg max-w-2xl">
            Create custom fragrance formulas with optimization modes, scent
            structure visualization, scaling controls, and ingredient market
            lookup.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {modes.map((modeOption) => (
            <button
              key={modeOption.id}
              onClick={() => {
                setMode(modeOption.id);
                setInput("");
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left group ${
                mode === modeOption.id
                  ? "gradient-card border-perfume-accent bg-perfume-accent/10 shadow-lg shadow-perfume-accent/30"
                  : "gradient-card border-slate-700 hover:border-perfume-accent/50"
              }`}
            >
              <h3 className="font-bold text-white mb-1">{modeOption.label}</h3>
              <p className="text-sm text-pale-purple/70 group-hover:text-pale-purple transition-colors">
                {modeOption.desc}
              </p>
            </button>
          ))}
        </div>

        <Card className="p-8 mb-12 animate-scale-in">
          <form onSubmit={handleGenerate} className="space-y-6">
            <BlendingOptimizer
              selectedMode={optimizationMode}
              onModeChange={setOptimizationMode}
            />

            <hr className="border-slate-700" />

            <Textarea
              label={`${currentMode.label} Description`}
              placeholder={currentMode.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-32"
              helperText={
                mode === "ingredients"
                  ? "Enter ingredients separated by commas."
                  : undefined
              }
            />

            <Button
              type="submit"
              disabled={!input.trim() || loading}
              isLoading={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Creating your formula..." : "Generate Formula"}
            </Button>
          </form>
        </Card>

        {error && (
          <Card className="p-6 bg-red-500/10 border border-red-500/30 mb-8 animate-fade-in">
            <p className="text-red-400 font-medium">{error}</p>
          </Card>
        )}

        {loading && <LoadingSpinner />}

        {!loading && formula && (
          <div className="animate-fade-in-up space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pale-green to-pale-purple bg-clip-text text-transparent">
              Your Custom Formula
            </h2>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <FormulaChart formula={formula} />
                </Card>
                <Card className="p-6">
                  <ScentPyramid formula={formula} />
                </Card>
              </div>

              <div className="space-y-6">
                <FormulaDisplay formula={formula} />
                <FormulaScaler formula={formula} baseVolume={formula.baseVolume ?? 50} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
