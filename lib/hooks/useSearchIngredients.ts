"use client";

import { useState } from "react";
import { ApiResponse, MaterialSearchResult } from "@/types";

export function useSearchIngredients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MaterialSearchResult | null>(null);

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(query)}`);
      const payload = (await response.json()) as ApiResponse<MaterialSearchResult>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Search failed");
      }
      setResult(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { search, result, loading, error };
}
