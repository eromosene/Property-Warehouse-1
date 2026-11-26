import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Where the real backend lives (override with API_PROXY_TARGET in .env.local). */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ?? "https://property-warehouse-1.onrender.com";

/* Every /api/* request is caught here and forwarded to the backend by our own
   server. Two things make this work:
     1. The browser only talks to localhost:3000 (same origin as the page), so the
        backend's CORS origin list never sees it.
     2. We delete the "origin" header before forwarding — the backend allows
        requests without one, because those can only come from a server, not from
        someone else's website riding on your login cookies. */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("origin");
  headers.delete("host");

  return NextResponse.rewrite(
    `${API_PROXY_TARGET}${request.nextUrl.pathname}${request.nextUrl.search}`,
    { request: { headers } },
  );
}

export const config = {
  matcher: "/api/:path*",
};
