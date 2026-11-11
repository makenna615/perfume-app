import type { CostTier, PriceTier, SimilarRelationship } from "@/types";

export const COST_LABEL: Record<CostTier, { symbol: string; label: string }> = {
  low: { symbol: "$", label: "Inexpensive" },
  medium: { symbol: "$$", label: "Moderate" },
  high: { symbol: "$$$", label: "Expensive" },
  "very-high": { symbol: "$$$$", label: "Very expensive" },
};

export const PRICE_TIER_LABEL: Record<PriceTier, string> = {
  budget: "Budget",
  designer: "Designer",
  niche: "Niche",
  luxury: "Luxury",
};

export const RELATIONSHIP_LABEL: Record<SimilarRelationship, string> = {
  dupe: "Near-identical dupe",
  "close-alternative": "Close alternative",
  flanker: "Flanker",
  "same-family": "Same family",
};

export const ROLE_TIMING = {
  top: "first 5–30 min",
  middle: "20 min – 4 h",
  base: "4 h and beyond",
} as const;

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Format a number with at most `digits` decimals, dropping trailing zeros. */
export function fmt(value: number, digits = 2): string {
  return Number(value.toFixed(digits)).toString();
}
