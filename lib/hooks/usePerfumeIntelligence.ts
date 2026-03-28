"use client";

import { useState } from "react";
import { ApiResponse, PerfumeIntelligenceResponse } from "@/types";

export function usePerfumeIntelligence() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PerfumeIntelligenceResponse | null>(null);

  const search = async (perfumeName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/perfume-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfumeName }),
      });

      const payload = (await response.json()) as ApiResponse<PerfumeIntelligenceResponse>;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to fetch perfume details");
      }

      setResult(payload.data);
      return payload.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch perfume details";
      setError(message);
      setResult(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    search,
    result,
    loading,
    error,
    clear: () => {
      setResult(null);
      setError(null);
    },
  };
}
