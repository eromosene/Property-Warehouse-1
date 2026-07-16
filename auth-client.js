/* ══════════════════════════════════════════════════
   Shared API client — Property Warehouse
   Talks to the Phase 1 backend (see /backend). Depends on config.js (API_BASE) being loaded
   first. Despite the filename (kept from Stage 1), this now hosts three things used across
   pages: a generic request helper (PWApi), auth-specific convenience wrappers on top of it
   (PWAuth), and a generic loading/error overlay (PWOverlay).
══════════════════════════════════════════════════ */

const PWApi = (() => {
  // Generic fetch wrapper: always sends cookies, always parses JSON, and — importantly —
  // distinguishes "the backend is unreachable" (status: 0) from a real HTTP error status, so
  // callers never mistake a network blip for a 401/404/etc.
  async function request(path, options = {}) {
    let res;
    try {
      res = await fetch(API_BASE + path, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
    } catch (networkErr) {
      return { ok: false, status: 0, error: "network", data: null };
    }
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* e.g. 204 No Content */
    }
    return { ok: res.ok, status: res.status, error: data?.error || null, data };
  }

  return { request };
})();

const PWAuth = (() => {
  // Cache of the last-known session user for pages that just want a quick, non-blocking read
  // (e.g. prefilling a chat form). undefined = never checked this page load; null = logged out.
  let cachedUser;

  async function signup(payload) {
    const res = await PWApi.request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) cachedUser = res.data.user;
    return res;
  }

  async function login(payload) {
    const res = await PWApi.request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) cachedUser = res.data.user;
    return res;
  }

  async function adminLogin(payload) {
    const res = await PWApi.request("/api/auth/admin/login", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) cachedUser = res.data.user;
    return res;
  }

  async function logout() {
    const res = await PWApi.request("/api/auth/logout", { method: "POST" });
    cachedUser = null;
    return res;
  }

  // Returns { user, networkError }. `networkError: true` means the backend couldn't be reached
  // at all — callers should show a retryable error, NOT redirect to the login page, since that
  // would incorrectly log out an already-authenticated user over a transient network issue.
  async function getSession() {
    const res = await PWApi.request("/api/auth/me", { method: "GET" });
    if (res.ok) {
      cachedUser = res.data.user;
      return { user: cachedUser, networkError: false };
    }
    if (res.status === 0) {
      return { user: null, networkError: true };
    }
    cachedUser = null;
    return { user: null, networkError: false };
  }

  function getCachedUser() {
    return cachedUser === undefined ? null : cachedUser;
  }

  return { signup, login, adminLogin, logout, getSession, getCachedUser };
})();

/* ── Minimal self-injecting loading/error overlay ──
   Same self-contained-widget pattern already used by feedback-bubble.js elsewhere in this
   codebase: no page markup changes needed, just call PWOverlay.showLoading()/showError()/hide().
   Used for full-page blocking states (auth-gated pages waiting on a session check); pages doing
   a lighter-weight, non-blocking fetch (e.g. the listings grid re-filtering) use their own
   inline loading/error state instead so the rest of the page stays usable. */
const PWOverlay = (() => {
  let overlay;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "pw-page-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "#f7f1ec",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      fontFamily: "Manrope, sans-serif",
      textAlign: "center",
      padding: "24px",
    });
    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  function showLoading(message = "Loading…") {
    const el = ensureOverlay();
    el.innerHTML = `
      <div style="width:34px;height:34px;border:3px solid #e4dccf;border-top-color:#a97e4b;border-radius:50%;animation:pw-overlay-spin .8s linear infinite"></div>
      <p style="color:#5d6876;font-size:13px;font-weight:700;margin:0">${message}</p>
      <style>@keyframes pw-overlay-spin{to{transform:rotate(360deg)}}</style>`;
    el.style.display = "flex";
  }

  function showError(message, { retry } = {}) {
    const el = ensureOverlay();
    el.innerHTML = `
      <p style="color:#c0392b;font-size:14px;font-weight:800;max-width:320px;margin:0">${message}</p>
      ${retry ? `<button id="pw-overlay-retry" style="padding:10px 20px;border-radius:10px;border:none;background:#a97e4b;color:#fff;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px">Retry</button>` : ""}`;
    el.style.display = "flex";
    if (retry) document.getElementById("pw-overlay-retry").addEventListener("click", retry);
  }

  function hide() {
    if (overlay) overlay.style.display = "none";
  }

  return { showLoading, showError, hide };
})();
