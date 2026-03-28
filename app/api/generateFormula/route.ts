import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

interface GenerateFormulaBody {
  prompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = (await request.json()) as GenerateFormulaBody;
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: "No response from model" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate formula",
      },
      { status: 500 }
    );
  }
}
