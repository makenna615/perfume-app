import { AIService } from "./types";
import { OpenAIService } from "./openai-service";
import { MockAIService } from "./mock-service";

let aiService: AIService | null = null;

export function getAIService(): AIService {
  if (aiService) {
    return aiService;
  }

  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "mock") {
    aiService = new MockAIService();
  } else if (provider === "openai") {
    try {
      aiService = new OpenAIService();
    } catch (error) {
      console.warn("OpenAI service failed to initialize, falling back to mock:", error);
      aiService = new MockAIService();
    }
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  return aiService;
}

export function resetAIService(): void {
  aiService = null;
}
