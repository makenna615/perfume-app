"use client";

import { useState } from "react";
import { ApiResponse, BuilderMode, Formula, OptimizationMode } from "@/types";

export function useGenerateFormula() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);

  const generate = async (
    mode: BuilderMode,
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
      const payload = (await response.json()) as ApiResponse<Formula>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to generate formula");
      }
      setFormula(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate formula");
    } finally {
      setLoading(false);
    }
  };

  return { generate, formula, setFormula, loading, error };
}
