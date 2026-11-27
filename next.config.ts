import type { NextConfig } from "next";

/* There are no rewrites here on purpose: /api/* requests are forwarded to the
   backend by proxy.ts, which also strips the browser's "origin" header so
   the backend's CORS list never blocks us. */
const nextConfig: NextConfig = {
  /* Hide the dev-only Next.js "N" badge in the corner (never shown on the live site). */
  devIndicators: false,
};

export default nextConfig;
