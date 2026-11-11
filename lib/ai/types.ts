// AI Service Interface - provider agnostic.
// Every feature talks to the model through a single JSON-returning call so that
// model choice, JSON mode, retries and token limits live in one place.

export type AITask =
  | "similar-perfumes"
  | "notes-search"
  | "formula"
  | "ingredient-search"
  | "perfume-details"
  | "page-extraction";

export interface AIRequest {
  task: AITask;
  /** Role, domain knowledge and accuracy rules. */
  system: string;
  /** The task-specific instructions, user input and JSON schema. */
  prompt: string;
  /** Low for factual lookups, higher for creative composition. */
  temperature?: number;
  maxTokens?: number;
}

export interface AIService {
  /** Returns the parsed JSON object produced by the model. Throws AIServiceError on failure. */
  generateJSON(request: AIRequest): Promise<Record<string, unknown>>;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number = 502
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}
