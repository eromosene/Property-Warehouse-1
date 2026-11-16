/* Shared API client — the single doorway to the backend.
   Every page calls api<T>(path, options); this module handles the base URL, the auth
   token, JSON parsing, and turning failures into thrown Errors (see the note below). */

/* Empty base URL = every call is relative ("/api/...") and therefore same-origin.
   The rewrite in next.config.ts forwards those requests to the real backend from
   our own server, which sidesteps the backend's CORS origin list entirely. */
const API_BASE = "";

/* The login token from localStorage as a fetch header, shared by api() below and
   by the upload fetches in create-listing-page (which send FormData, not JSON,
   so they cannot use api() directly). */
export function authHeader(): Record<string, string> {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/* The localStorage key that holds the login "card" (a Bearer token).
   auth.ts WRITES it when you log in; api.ts READS it on every request.
   One shared constant = they can never disagree about the name. */
export const TOKEN_KEY = "pw_token";

export type Listing = {
    id: string;
    landlordId: string;
    landlordName: string;
    landlordPhone: string;
    landlordWhatsApp: string;
    landlordSince?: string;
    landlordVerified: boolean;
    landlordListings: number;
    title: string;
    area: string;
    lga: string;
    address: string;
    type: string;
    rentPerYear: number;
    cautionFee: number;
    serviceCharge: number;
    totalMoveIn: number;
    isVerified: boolean;
    isMonthly: boolean;
    beds: number;
    baths: number;
    amenities: string[];
    description: string;
    images: string[];
    views: number;
    status: string;
    ownershipDocTypes: string[];
    ownershipDocCount: number;
    createdAt?: string;
};

/* Generic over T: "I expect this exact JSON 'box' to come back." */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
            ...(init?.headers ?? {}),
        },
    });

    // 204 No Content (e.g. favourites POST/DELETE) has no JSON body — tolerate that.
    const data = await response.json().catch(() => null);

    // Why we throw instead of returning an error object:
    //   - could not connect at all  -> fetch throws TypeError  (pages read this as "network")
    //   - server answered with error -> we throw Error(msg)    (pages read this as "server")
    if (!response.ok) {
        throw new Error(data?.error ?? data?.message ?? `Request failed (${response.status})`);
    }

    return data as T;
}

export const naira = (value: number) => `₦${Number(value).toLocaleString("en-NG")}`;