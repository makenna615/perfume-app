"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BeakerIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import LoadingSpinner, { ShimmerLoader } from "@/components/ui/LoadingSpinner";
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
  icon: React.ReactNode;
}[] = [
  {
    id: "vibe",
    label: "By Vibe",
    desc: "Describe a mood, feeling, or scenario",
    placeholder: "e.g., rainy forest at night, cozy autumn library, fresh citrus morning...",
    icon: "🎭",
  },
  {
    id: "ingredients",
    label: "By Ingredients",
    desc: "Mix what you have on hand",
    placeholder: "e.g., vanilla, ylang-ylang, sandalwood, bergamot",
    icon: "🧪",
  },
  {
    id: "inspired",
    label: "By Inspiration",
    desc: "Transform a famous fragrance",
    placeholder: "e.g., Dior Sauvage, Creed Aventus, Chanel No. 5",
    icon: "✨",
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center will-change-transform"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-perfume-accent to-purple-400 mb-6 opacity-20">
            <BeakerIcon className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6 bg-gradient-to-r from-[#b148ff] via-[#9650ff] to-[#7a64ff] bg-clip-text text-transparent">
            Craft Your Signature Scent
          </h1>
          <p className="text-lg md:text-xl text-pale-purple/80 max-w-3xl mx-auto font-inter leading-relaxed">
            Create custom fragrance formulas with AI-powered optimization, precise scaling, and real-time market pricing.
          </p>
        </motion.div>

        {/* Mode Selection - Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-perfume-accent/20 border border-perfume-accent flex items-center justify-center text-sm font-bold text-perfume-accent">
              1
            </span>
            <h2 className="text-xl md:text-2xl font-playfair font-bold text-pale-blue">
              Choose Your Method
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {modes.map((modeOption) => (
              <motion.button
                key={modeOption.id}
                onClick={() => {
                  setMode(modeOption.id);
                  setInput("");
                }}
                whileHover={{ scale: 1.02 }}
                aria-pressed={mode === modeOption.id}
                className="text-left"
              >
                <div
                  className={`card-luxury p-6 md:p-8 transition-all ${
                    mode === modeOption.id
                      ? "border-perfume-accent/60 ring-2 ring-perfume-accent/40 bg-gradient-to-br from-perfume-accent/15 via-perfume-surface/95 to-perfume-accent/10 shadow-luxury"
                      : "hover:border-perfume-accent/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{modeOption.icon}</div>
                    {mode === modeOption.id && (
                      <span className="text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 bg-perfume-accent/30 border border-perfume-accent/50 text-pale-blue">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-pale-blue mb-2">
                    {modeOption.label}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400 font-inter">
                    {modeOption.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Formula Configuration - Step 2 & 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card variant="luxury" className="p-8 md:p-12">
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Step 2 - Optimization Mode */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-full bg-perfume-accent/20 border border-perfume-accent flex items-center justify-center text-sm font-bold text-perfume-accent">
                    2
                  </span>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-pale-blue">
                    Optimization Mode
                  </h3>
                </div>
                <BlendingOptimizer
                  selectedMode={optimizationMode}
                  onModeChange={setOptimizationMode}
                />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-perfume-accent/30 to-transparent" />

              {/* Step 3 - Input */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-full bg-perfume-accent/20 border border-perfume-accent flex items-center justify-center text-sm font-bold text-perfume-accent">
                    3
                  </span>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-pale-blue">
                    Your Input
                  </h3>
                </div>
                <Textarea
                  label={`${currentMode.label} Description`}
                  placeholder={currentMode.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-32 md:h-40"
                  helperText={
                    mode === "ingredients"
                      ? "Separate multiple ingredients with commas for best results"
                      : "Be specific and creative for better AI-generated formulas"
                  }
                />
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                isLoading={loading}
                size="lg"
                variant="luxury"
                className="w-full !border-0 bg-gradient-to-r from-perfume-accent via-pale-purple to-purple-400 text-white shadow-premium hover:shadow-luxury hover:brightness-110"
              >
                {loading ? "Crafting Your Formula..." : "Generate Formula"}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 font-medium">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card variant="luxury" className="p-12">
              <div className="text-center mb-8">
                <SparklesIcon className="w-12 h-12 animate-spin text-perfume-accent mx-auto" />
                <p className="text-pale-blue mt-4 font-playfair text-lg">Generating your custom formula...</p>
              </div>
              <ShimmerLoader />
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {!loading && formula && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {/* Results Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-pale-green" />
                <span className="text-sm font-semibold text-pale-green uppercase tracking-wide">Formula Created</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-pale-blue mb-2">
                {formula.name}
              </h2>
              {formula.inspiration && (
                <p className="text-slate-400 font-inter">{formula.inspiration}</p>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Visualizations */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card variant="luxury" className="p-6 md:p-8">
                    <h3 className="text-lg font-playfair font-bold text-pale-blue mb-6">Concentration Breakdown</h3>
                    <FormulaChart formula={formula} />
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card variant="luxury" className="p-6 md:p-8">
                    <h3 className="text-lg font-playfair font-bold text-pale-blue mb-6">Scent Structure</h3>
                    <ScentPyramid formula={formula} />
                  </Card>
                </motion.div>
              </div>

              {/* Right Column - Details & Controls */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FormulaDisplay formula={formula} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FormulaScaler formula={formula} baseVolume={formula.baseVolume ?? 50} />
                </motion.div>
              </div>
            </div>

            {/* Create Another Button */}
            <div className="text-center pt-8">
              <Button
                onClick={() => {
                  setInput("");
                  setOptimizationMode("balanced");
                }}
                variant="outline"
                size="lg"
              >
                Create Another Formula
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
