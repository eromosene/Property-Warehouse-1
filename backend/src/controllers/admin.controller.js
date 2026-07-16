const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings } = require('../db/schema');
const { serializeListingRow, serializeListingRows } = require('../services/listings.service');

// GET /api/admin/listings — all listings, any status. Mirrors getAllListingsAdmin() in
// listings-data.js, used by admin.js's Listings section.
function list(req, res) {
  const rows = db.select().from(listings).all();
  res.json({ listings: serializeListingRows(rows) });
}

function setStatus(id, status) {
  const row = db.select().from(listings).where(eq(listings.id, id)).get();
  if (!row) return null;
  db.update(listings).set({ status, updatedAt: new Date() }).where(eq(listings.id, id)).run();
  return db.select().from(listings).where(eq(listings.id, id)).get();
}

// PATCH /api/admin/listings/:id/approve — mirrors admin.js's approveListing().
function approve(req, res) {
  const updated = setStatus(req.params.id, 'active');
  if (!updated) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: serializeListingRow(updated) });
}

// PATCH /api/admin/listings/:id/reject — mirrors admin.js's rejectListing().
function reject(req, res) {
  const updated = setStatus(req.params.id, 'rejected');
  if (!updated) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: serializeListingRow(updated) });
}

// POST /api/admin/listings/bulk-approve — mirrors admin.js's bulkApproveListings().
function bulkApprove(req, res) {
  const pending = db.select().from(listings).where(eq(listings.status, 'pending')).all();
  const now = new Date();
  pending.forEach((l) => db.update(listings).set({ status: 'active', updatedAt: now }).where(eq(listings.id, l.id)).run());
  res.json({ updatedCount: pending.length });
}

const ADMIN_EDITABLE_FIELDS = ['title', 'area', 'type', 'rentPerYear', 'landlordName', 'status'];

// PATCH /api/admin/listings/:id — generic inline edit, mirrors admin.js's openListingEdit()/saveListingEdit().
function update(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const updates = {};
  for (const field of ADMIN_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  updates.updatedAt = new Date();

  db.update(listings).set(updates).where(eq(listings.id, row.id)).run();
  const updated = db.select().from(listings).where(eq(listings.id, row.id)).get();
  res.json({ listing: serializeListingRow(updated) });
}

// DELETE /api/admin/listings/:id — mirrors admin.js's deleteListingAdmin().
function remove(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });
  db.delete(listings).where(eq(listings.id, row.id)).run();
  res.status(204).end();
}

module.exports = { list, approve, reject, bulkApprove, update, remove };
