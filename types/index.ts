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
