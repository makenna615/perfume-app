"use client";

import { useState } from "react";
import { ApiResponse, SimilarSearchResult } from "@/types";

export function useSimilarPerfumes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimilarSearchResult | null>(null);

  const search = async (query: string, searchType: "perfume" | "notes") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/perfumes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, searchType }),
      });
      const payload = (await response.json()) as ApiResponse<SimilarSearchResult>;
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

  return { search, result, loading, error, clear: () => setResult(null) };
}
