import type { NextConfig } from "next";

/* There are no rewrites here on purpose: /api/* requests are forwarded to the
   backend by middleware.ts, which also strips the browser's "origin" header so
   the backend's CORS list never blocks us. */
const nextConfig: NextConfig = {};

export default nextConfig;
