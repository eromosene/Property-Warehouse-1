/* favourites.ts — the "save for later" ♥ feature.
   Small, but centralised so both the listings page and the detail page share ONE copy
   instead of each hand-rolling the same three calls (they used to be duplicated). */

import { api } from "./api";

// IDs of every listing the current tenant has saved → one Set we can `.has(id)` against.
// (Backend returns the full saved listings; we only keep their ids, in a Set for fast "is it saved?".)
export async function getFavouriteIds(): Promise<Set<string>> {
    const res = await api<{ listings: { id: string }[] }>("/api/favourites");
    return new Set(res.listings.map((l) => l.id));
}

// POST = "save this one". 204 on success; api() tolerates empty bodies.
export function saveFavourite(listingId: string) {
    return api(`/api/favourites/${encodeURIComponent(listingId)}`, { method: "POST" });
}

// DELETE = "un-save this one". Also 204 on success.
export function unsaveFavourite(listingId: string) {
    return api(`/api/favourites/${encodeURIComponent(listingId)}`, { method: "DELETE" });
}