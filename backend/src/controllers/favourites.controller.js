const { eq, and, inArray } = require('drizzle-orm');
const { db } = require('../db/client');
const { favourites, listings } = require('../db/schema');
const { serializeListingRows } = require('../services/listings.service');

// GET /api/favourites — tenant-only. Returns full listing objects (same shape as
// GET /api/listings) for every listing the tenant has saved, mirrors dashboard.js's
// renderSaved() needing full cards, not just IDs.
async function list(req, res) {
  const rows = await db.select().from(favourites).where(eq(favourites.tenantId, req.user.id));
  if (!rows.length) return res.json({ listings: [] });

  const listingIds = rows.map((r) => r.listingId);
  const listingRows = await db.select().from(listings).where(inArray(listings.id, listingIds));
  res.json({ listings: await serializeListingRows(listingRows) });
}

// POST /api/favourites/:listingId — tenant-only, idempotent (saving an already-saved listing
// is a no-op, not an error — mirrors the heart button being clickable regardless of state).
async function save(req, res) {
  const { listingId } = req.params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  await db
    .insert(favourites)
    .values({ id: crypto.randomUUID(), tenantId: req.user.id, listingId, createdAt: new Date() })
    .onConflictDoNothing();

  res.status(204).end();
}

// DELETE /api/favourites/:listingId — tenant-only, idempotent (unsaving a listing that isn't
// saved, or doesn't exist, still succeeds — nothing left for the tenant to have saved either way).
async function remove(req, res) {
  const { listingId } = req.params;
  await db.delete(favourites).where(and(eq(favourites.tenantId, req.user.id), eq(favourites.listingId, listingId)));
  res.status(204).end();
}

module.exports = { list, save, remove };
