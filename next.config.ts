import path from "node:path";
import type { NextConfig } from "next";

const securityHeaders = [
  // Don't allow the app to be embedded in other sites (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Don't let browsers guess content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin to external sites (e.g. Fragrantica, Sephora links).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    // Pin the project root so Turbopack never resolves modules from the parent folder.
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
