const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings } = require('../db/schema');
const { serializeListingRow, serializeListingRows } = require('../services/listings.service');

// GET /api/admin/listings — all listings, any status. Mirrors getAllListingsAdmin() in
// listings-data.js, used by admin.js's Listings section.
async function list(req, res) {
  const rows = await db.select().from(listings);
  res.json({ listings: await serializeListingRows(rows) });
}

async function setStatus(id, status) {
  const [row] = await db.select().from(listings).where(eq(listings.id, id));
  if (!row) return null;
  await db.update(listings).set({ status, updatedAt: new Date() }).where(eq(listings.id, id));
  const [updated] = await db.select().from(listings).where(eq(listings.id, id));
  return updated;
}

// PATCH /api/admin/listings/:id/approve — mirrors admin.js's approveListing().
async function approve(req, res) {
  const updated = await setStatus(req.params.id, 'active');
  if (!updated) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: await serializeListingRow(updated) });
}

// PATCH /api/admin/listings/:id/reject — mirrors admin.js's rejectListing().
async function reject(req, res) {
  const updated = await setStatus(req.params.id, 'rejected');
  if (!updated) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: await serializeListingRow(updated) });
}

// POST /api/admin/listings/bulk-approve — mirrors admin.js's bulkApproveListings().
async function bulkApprove(req, res) {
  const pending = await db.select().from(listings).where(eq(listings.status, 'pending'));
  const now = new Date();
  for (const l of pending) {
    await db.update(listings).set({ status: 'active', updatedAt: now }).where(eq(listings.id, l.id));
  }
  res.json({ updatedCount: pending.length });
}

const ADMIN_EDITABLE_FIELDS = ['title', 'area', 'type', 'rentPerYear', 'landlordName', 'status'];

// PATCH /api/admin/listings/:id — generic inline edit, mirrors admin.js's openListingEdit()/saveListingEdit().
async function update(req, res) {
  const [row] = await db.select().from(listings).where(eq(listings.id, req.params.id));
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const updates = {};
  for (const field of ADMIN_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  updates.updatedAt = new Date();

  await db.update(listings).set(updates).where(eq(listings.id, row.id));
  const [updated] = await db.select().from(listings).where(eq(listings.id, row.id));
  res.json({ listing: await serializeListingRow(updated) });
}

// DELETE /api/admin/listings/:id — mirrors admin.js's deleteListingAdmin().
async function remove(req, res) {
  const [row] = await db.select().from(listings).where(eq(listings.id, req.params.id));
  if (!row) return res.status(404).json({ error: 'Listing not found' });
  await db.delete(listings).where(eq(listings.id, row.id));
  res.status(204).end();
}

module.exports = { list, approve, reject, bulkApprove, update, remove };
