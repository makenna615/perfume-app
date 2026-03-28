"use client";

import { useState } from "react";
import { Formula, ApiResponse } from "@/types";
import type { OptimizationMode } from "@/lib/ai/prompts";

export function useGenerateFormula() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);

  const generate = async (
    mode: "vibe" | "ingredients" | "inspired",
    input: string,
    optimizationMode: OptimizationMode = "balanced"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input, optimizationMode }),
      });

      const data: ApiResponse<Formula> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to generate formula");
      }

      setFormula(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFormula(null);
    } finally {
      setLoading(false);
    }
  };

  return { generate, formula, loading, error };
}
