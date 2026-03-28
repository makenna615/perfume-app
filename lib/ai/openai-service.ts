import { AIService } from "./types";
import OpenAI from "openai";

export class OpenAIService implements AIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateSimilarPerfumes(prompt: string): Promise<string> {
    return this.callOpenAI(prompt);
  }

  async generateFormula(prompt: string): Promise<string> {
    return this.callOpenAI(prompt);
  }

  async getIngredientInfo(prompt: string): Promise<string> {
    return this.callOpenAI(prompt);
  }

  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const message = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0] : content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
}
