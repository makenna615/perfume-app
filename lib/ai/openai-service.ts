import OpenAI, { toFile } from "openai";
import { AIRequest, AIService, AIServiceError, WebJSONResult, WebSource } from "./types";

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

  async searchWebJSON(request: AIRequest): Promise<WebJSONResult> {
    const isReasoningModel = /^(gpt-5|o\d)/.test(this.model);
    // Note: the API does not allow JSON mode together with web search, so the JSON is
    // parsed from the text reply (the prompt asks for a bare JSON object).
    const response = await this.client.responses.create(
      {
        model: this.model,
        instructions: request.system,
        input: request.prompt,
        tools: [{ type: "web_search" }],
        include: ["web_search_call.action.sources"],
        max_output_tokens: (request.maxTokens ?? 2000) + (isReasoningModel ? 6000 : 0),
        ...(isReasoningModel
          ? { reasoning: { effort: (process.env.OPENAI_REASONING_EFFORT || "low") as "low" | "medium" | "high" } }
          : { temperature: request.temperature ?? 0.1 }),
      },
      { timeout: 60_000 }
    );

    const data = parseJsonObject(response.output_text ?? "");
    if (!data) {
      throw new AIServiceError("The web search returned an unreadable response. Please try again.");
    }
    return { data, sources: collectSources(response.output) };
  }

  async renderFromReference(reference: Buffer, prompt: string): Promise<Buffer> {
    const result = await this.client.images.edit(
      {
        model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
        image: await toFile(reference, "reference.png", { type: "image/png" }),
        prompt,
        background: "transparent",
        size: "1024x1536",
        quality: "medium",
        output_format: "png",
        input_fidelity: "high", // stay close to the reference bottle
      },
      { timeout: 120_000 }
    );
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new AIServiceError("The image model returned no image.");
    return Buffer.from(b64, "base64");
  }
}

const DEFAULT_IMAGE_MODEL = "gpt-image-1.5"; // supports transparent backgrounds

// Fragrance databases first, then everything else (usually the brand's own site).
const TRUSTED_HOSTS = ["fragrantica.", "parfumo.", "luckyscent.", "basenotes.", "osmoz.", "notinoimg."];

/** Pages the model cited, then pages the search tool opened — always from the API, never model text. */
function collectSources(output: unknown): WebSource[] {
  const cited: WebSource[] = [];
  const consulted: WebSource[] = [];
  for (const item of Array.isArray(output) ? output : []) {
    const entry = item as {
      type?: string;
      action?: { sources?: Array<{ url?: string; title?: string }> };
      content?: Array<{ annotations?: Array<{ type?: string; url?: string; title?: string }> }>;
    };
    if (entry.type === "web_search_call") {
      for (const s of entry.action?.sources ?? []) if (s.url) consulted.push({ url: s.url, title: s.title });
    }
    if (entry.type === "message") {
      for (const c of entry.content ?? []) {
        for (const a of c.annotations ?? []) if (a.type === "url_citation" && a.url) cited.push({ url: a.url, title: a.title });
      }
    }
  }

  const seen = new Set<string>();
  const rank = (s: WebSource) => {
    const host = safeHost(s.url);
    const i = TRUSTED_HOSTS.findIndex((h) => host.includes(h));
    return i === -1 ? TRUSTED_HOSTS.length : i;
  };
  return [...cited, ...consulted.sort((a, b) => rank(a) - rank(b))]
    .filter((s) => {
      const host = safeHost(s.url);
      if (!host || seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    })
    .slice(0, 5);
}

function safeHost(url: string): string {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.hostname.toLowerCase() : "";
  } catch {
    return "";
  }
}
