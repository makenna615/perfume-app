import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { authCookieName, createSessionToken } from "@/lib/auth/session";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attemptsByIp = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || entry.resetAt < now) {
    attemptsByIp.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || entry.resetAt < now) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  attemptsByIp.set(ip, { ...entry, count: entry.count + 1 });
}

function clearAttempts(ip: string): void {
  attemptsByIp.delete(ip);
}

function safePasswordMatch(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait and try again." },
        { status: 429 }
      );
    }

    const { password } = (await request.json()) as { password?: string };
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword) {
      return NextResponse.json(
        { success: false, error: "APP_PASSWORD is not configured on the server." },
        { status: 500 }
      );
    }

    if (!password || !safePasswordMatch(password, appPassword)) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    clearAttempts(clientIp);
    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: authCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
