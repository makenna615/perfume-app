"use client";

import { useState } from "react";
import { Ingredient, ApiResponse } from "@/types";

export function useSearchIngredients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(query)}`);
      const data: ApiResponse<Ingredient[]> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to search ingredients");
      }

      setResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { search, results, loading, error, selectedIngredient, setSelectedIngredient };
}
