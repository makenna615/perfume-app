// AI Service Interface - provider agnostic.
// Every feature talks to the model through a single JSON-returning call so that
// model choice, JSON mode, retries and token limits live in one place.

export type AITask =
  | "similar-perfumes"
  | "notes-search"
  | "formula"
  | "ingredient-search"
  | "perfume-details"
  | "page-extraction"
  | "bottle"
  | "web-perfume"
  | "product-page";

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

export interface WebSource {
  url: string;
  title?: string;
}

export interface WebJSONResult {
  data: Record<string, unknown>;
  /** Pages the search tool actually consulted (reported by the API, not written by the model). */
  sources: WebSource[];
}

export interface AIService {
  /** Returns the parsed JSON object produced by the model. Throws AIServiceError on failure. */
  generateJSON(request: AIRequest): Promise<Record<string, unknown>>;
  /** Like generateJSON, but the model may search the web first. Slower and costlier — use as a fallback. */
  searchWebJSON(request: AIRequest): Promise<WebJSONResult>;
  /** Image-to-image: returns a PNG (transparent background) based on the reference photo. */
  renderFromReference(reference: Buffer, prompt: string): Promise<Buffer>;
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
