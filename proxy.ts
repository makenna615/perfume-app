import { NextRequest, NextResponse } from "next/server";
import { authCookieName, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_PATHS = new Set(["/login"]);

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|woff2?)$/i) !==
      null
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow auth endpoints to establish/clear session.
  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }

  if (!process.env.APP_PASSWORD) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: "APP_PASSWORD is not configured on the server." },
        { status: 500 }
      );
    }
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const token = request.cookies.get(authCookieName)?.value;
  const isValidSession = await verifySessionToken(token);
  if (isValidSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const nextParam = encodeURIComponent(`${pathname}${search}`);
  return NextResponse.redirect(new URL(`/login?next=${nextParam}`, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
