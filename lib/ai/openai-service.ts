import OpenAI from "openai";
import { AIRequest, AIService, AIServiceError } from "./types";

// Accuracy/latency sweet spot in testing; set OPENAI_MODEL=gpt-5.5 for the most accurate (slower) answers.
const DEFAULT_MODEL = "gpt-5.4-mini";

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const attempt = (text: string) => {
    try {
      const value = JSON.parse(text);
      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  };

  return attempt(raw) ?? attempt(raw.match(/\{[\s\S]*\}/)?.[0] ?? "");
}

export class OpenAIService implements AIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  }

  async generateJSON(request: AIRequest): Promise<Record<string, unknown>> {
    const maxAttempts = 2;
    const outputTokens = request.maxTokens ?? 2500;
    // Reasoning models (gpt-5.x, o-series) take max_completion_tokens — which also
    // has to cover hidden reasoning tokens — and only support the default temperature.
    const isReasoningModel = /^(gpt-5|o\d)/.test(this.model);
    const sampling = isReasoningModel
      ? {
          max_completion_tokens: outputTokens + 6000,
          reasoning_effort: (process.env.OPENAI_REASONING_EFFORT || "low") as "low" | "medium" | "high",
        }
      : { max_tokens: outputTokens, temperature: request.temperature ?? 0.2 };

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        ...sampling,
        // JSON mode guarantees syntactically valid JSON (unless the output is cut off).
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: request.system },
          {
            role: "user",
            content:
              attempt === 1
                ? request.prompt
                : `${request.prompt}\n\nYour previous reply was not a complete JSON object. Reply with ONLY the JSON object.`,
          },
        ],
      });

      const choice = completion.choices[0];
      const content = choice?.message?.content;
      if (!content) {
        continue;
      }

      const parsed = parseJsonObject(content);
      if (parsed) {
        return parsed;
      }

      if (choice.finish_reason === "length") {
        console.warn(`[ai:${request.task}] response truncated (output budget ${outputTokens} tokens)`);
      }
    }

    throw new AIServiceError("The AI returned an unreadable response. Please try again.");
  }
}
