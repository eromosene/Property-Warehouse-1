/* Auth helpers — "the front desk" of the app.
   login/signup give you a membership card (token) to put in your pocket (localStorage),
   getSession reads it back from the backend, and logout throws the card away. */

import { api, TOKEN_KEY } from "./api";

export type SessionUser = {
    id: string;
    role: "tenant" | "landlord" | "admin";
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    area: string | null;
    budget: string | number | null;
    propType: string | null;
    lga: string | null;
    isVerified: boolean;
    joinedDate: string | null;
};

export type SignupPayload = {
    role: "tenant" | "landlord";
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    area?: string; // tenant only
    budget?: string; // tenant only
    propType?: string; // landlord only
    lga?: string; // landlord only
};

/* ── Pocket (localStorage) helpers ── */

function getToken(): string | null {
    return typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
}

function setToken(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    window.localStorage.removeItem(TOKEN_KEY);
}

/* ── Session cache: ask the backend ONCE, share the answer everywhere ──
   currentUser   = last-known user, for cheap synchronous reads (e.g. pre-fill a chat name).
   sessionPromise = memoized in-flight/ready GET /api/auth/me, so clicking three hearts fires
                    one request, not three. */

let currentUser: SessionUser | null = null;
let sessionPromise: Promise<SessionResult> | null = null;

export type SessionResult = { user: SessionUser | null; networkError: boolean };

function forgetSession() {
    sessionPromise = null;
    currentUser = null;
}

export async function getSession(): Promise<SessionResult> {
    try {
        const data = await api<{ user: SessionUser }>("/api/auth/me");
        currentUser = data.user;
        return { user: data.user, networkError: false };
    } catch (reason) {
        // TypeError = couldn't reach the backend at all (see api.ts). Anything else (e.g. 401)
        // means the visitor simply isn't logged in — which is NOT an error.
        if (reason instanceof TypeError) {
            return { user: null, networkError: true };
        }
        currentUser = null;
        return { user: null, networkError: false };
    }
}

// Everyone waits on the same promise: `??=` means "reuse if it already exists".
export function getSharedSession(): Promise<SessionResult> {
    sessionPromise ??= getSession();
    return sessionPromise;
}

export function getCachedUser(): SessionUser | null {
    return currentUser;
}

/* ── Login / signup / logout ── */

export async function login(payload: { email: string; password: string; role?: "tenant" | "landlord" | "admin" }) {
    const data = await api<{ user: SessionUser; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    setToken(data.token);
    forgetSession();
    currentUser = data.user;
    return data.user;
}

export async function signup(payload: SignupPayload) {
    const data = await api<{ user: SessionUser; token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    setToken(data.token);
    forgetSession();
    currentUser = data.user;
    return data.user;
}

export async function adminLogin(payload: { email: string; password: string }) {
    const data = await api<{ user: SessionUser; token: string }>("/api/auth/admin/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    setToken(data.token);
    forgetSession();
    currentUser = data.user;
    return data.user;
}

// Best-effort server notice, but we always clear local state — even if the backend is down.
export async function logout() {
    try {
        await api("/api/auth/logout", { method: "POST" });
    } catch {
        /* ignore: the token is cleared locally regardless */
    }
    clearToken();
    forgetSession();
}