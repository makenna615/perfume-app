// AI Service Interface - Provider agnostic
export interface AIService {
  generateSimilarPerfumes(prompt: string): Promise<string>;
  generateFormula(prompt: string): Promise<string>;
  getIngredientInfo(prompt: string): Promise<string>;
}

export interface AIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
