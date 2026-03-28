"use client";

import { useState } from "react";
import { Perfume, ApiResponse } from "@/types";

export function useSimilarPerfumes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Perfume[]>([]);

  const search = async (query: string, searchType: "perfume" | "notes") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/perfumes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, searchType }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiResponse<Perfume[]> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to search perfumes");
      }

      const perfumes = data.data || [];
      
      if (!Array.isArray(perfumes)) {
        throw new Error("Invalid response format: expected array");
      }

      // Validate perfumes have required fields
      const validPerfumes = perfumes.filter(
        (p): p is Perfume => 
          p && 
          typeof p === "object" &&
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          typeof p.brand === "string" &&
          Array.isArray(p.topNotes) &&
          Array.isArray(p.middleNotes) &&
          Array.isArray(p.baseNotes)
      );

      setResults(validPerfumes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setResults([]);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { search, results, loading, error };
}
