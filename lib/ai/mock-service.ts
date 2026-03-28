import { AIService } from "./types";

// Mock service for fallback/testing
export class MockAIService implements AIService {
  async generateSimilarPerfumes(): Promise<string> {
    return JSON.stringify({
      basePerf: "Test Perfume",
      similarPerfumes: [
        {
          name: "Sauvage",
          brand: "Dior",
          matchPercentage: 85,
          sharedNotes: ["bergamot", "amber"],
          explanation: "Similar fresh aromatic profile",
        },
      ],
    });
  }

  async generateFormula(): Promise<string> {
    return JSON.stringify({
      formulaName: "Test Formula",
      ingredients: [
        { name: "bergamot", percentage: 3, role: "top" },
        { name: "rose", percentage: 5, role: "middle" },
        { name: "sandalwood", percentage: 8, role: "base" },
      ],
      totalPercentage: 16,
    });
  }

  async getIngredientInfo(): Promise<string> {
    return JSON.stringify({
      name: "Bergamot",
      description: "Bright citrus top note",
    });
  }
}
