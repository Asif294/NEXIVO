import type { NextConfig } from "next";

// Where the Django backend lives, as seen from the Next.js server (SSR side).
// - Local dev (no Docker): http://localhost:8000
// - Docker Compose:        http://backend:8000  (set via BACKEND_ORIGIN env)
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Django requires a trailing slash on API routes (APPEND_SLASH) and cannot
  // redirect a POST. Without this, Next normalizes `/api/account/login/` down
  // to `/api/account/login` through the rewrite, so it no longer matches the
  // DRF url pattern and Django's CSRF middleware rejects it. Keeping trailing
  // slashes preserves the slash end-to-end through the proxy.
  trailingSlash: true,

  // Proxy all /api/* calls to Django so the browser talks to a single origin.
  // This keeps the HttpOnly `refresh_token` cookie same-origin and avoids CORS.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
