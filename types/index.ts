export interface ScentNote {
  name: string;
  type: "top" | "middle" | "base";
  description?: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  description?: string;
  similarityScore?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  scentProfile: string[];
  role: "top" | "middle" | "base";
  typicalUsagePercent: number;
  volatility: "high" | "medium" | "low";
  description?: string;
  substitutes?: string[];
  supplier?: {
    name: string;
    price?: number; // USD per 100ml
    availability?: "in-stock" | "limited" | "backordered";
    link?: string;
  };
}

export interface Formula {
  id?: string;
  name: string;
  ingredients: FormulaIngredient[];
  inspiration?: string;
  optimizationMode?: "balanced" | "longevity" | "projection";
  baseVolume?: number; // ml
  createdAt?: Date;
}

export interface FormulaIngredient {
  ingredientId: string;
  ingredientName: string;
  percentage: number;
  role?: "top" | "middle" | "base";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PerfumeIntelligenceAvailability {
  store: string;
  region: string;
  url: string;
}

export interface PerfumeIntelligencePerformance {
  longevity: "poor" | "moderate" | "long-lasting" | "very long-lasting";
  sillage: "soft" | "moderate" | "strong" | "enormous";
}

export interface PerfumeIntelligencePricing {
  averageUSD: number;
  size: string;
}

export interface PerfumeIntelligenceDetails {
  name: string;
  brand: string;
  releaseYear?: number;
  perfumer?: string;
  gender?: "male" | "female" | "unisex";
  fragranceFamily?: string;
  accords: Array<{
    name: string;
    strength: "dominant" | "prominent" | "subtle";
  }>;
  description: string;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  performance?: PerfumeIntelligencePerformance;
  pricing?: PerfumeIntelligencePricing;
  availability: PerfumeIntelligenceAvailability[];
  community?: {
    rating: number;
    reviewsCount: number;
  };
}

export interface PerfumeIntelligenceSuggestion {
  name: string;
  brand: string;
  reason: string;
}

export interface PerfumeIntelligenceResponse {
  found: boolean;
  confidence?: "high" | "medium" | "low";
  ambiguous?: boolean;
  perfume: PerfumeIntelligenceDetails | null;
  suggestions: PerfumeIntelligenceSuggestion[];
}
