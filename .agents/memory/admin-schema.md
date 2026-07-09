---
name: Admin dashboard schema conventions
description: Key field names and storage patterns used by admin.js that shared utilities must match
---

## Announcements (`pw_announcements`)
- Active field is `isActive` (boolean) — NOT `active`
- Array is stored newest-first: admin uses `unshift()` before saving, so `[0]` is the most recent item
- Each announcement: `{ id, title, message, type, target, isActive, impressions, createdAt }`

**Why:** pw-site-utils.js and any other page-level code that reads announcements must use `isActive`, not `active`. Using the wrong key silently shows no banners.

**How to apply:** Whenever reading `pw_announcements` outside admin.js, filter with `a.isActive` and select `active[0]` for the newest item.

## Listings (`pw_listings`)
- Status field: `'pending'` | `'active'` | `'flagged'` | `'rejected'`
- `getAllListings()` — public, filters to `status === 'active'` or missing status (DEFAULT_LISTINGS have no status)
- `getAllListingsAdmin()` — admin only, returns all including pending/flagged/rejected

## Admin auth
- Auth is entirely client-side (demo/prototype only) — not suitable for production
- Credentials are hardcoded in admin.js and overridable via localStorage; no server-side session
