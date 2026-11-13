import { NextRequest, NextResponse } from "next/server";
import { authCookieName, verifySessionToken } from "@/lib/auth/session";

/**
 * Defense in depth: proxy.ts already blocks unauthenticated requests, but routes that
 * write data check the session themselves too. Returns a 401 response, or null if OK.
 */
export async function requireSession(request: NextRequest): Promise<NextResponse | null> {
  const valid = await verifySessionToken(request.cookies.get(authCookieName)?.value);
  return valid ? null : NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
