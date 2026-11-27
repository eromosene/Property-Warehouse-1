const { eq, desc, inArray } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings, listingDocuments, users, inquiries, feedback } = require('../db/schema');
const { serializeUser } = require('../utils/serialize');
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

const ADMIN_EDITABLE_FIELDS = ['title', 'area', 'type', 'rentPerYear', 'landlordName', 'status', 'isVerified'];

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

// GET /api/admin/users — every account (no password hashes), newest first, with each landlord's
// listing count and how many ownership documents they've uploaded (for the Verification tab).
async function listUsers(req, res) {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  const allListings = await db.select({ id: listings.id, landlordId: listings.landlordId }).from(listings);
  const docs = allListings.length
    ? await db
        .select({ listingId: listingDocuments.listingId })
        .from(listingDocuments)
        .where(inArray(listingDocuments.listingId, allListings.map((l) => l.id)))
    : [];

  const owner = Object.fromEntries(allListings.map((l) => [l.id, l.landlordId]));
  const listingCount = {};
  const docCount = {};
  for (const l of allListings) listingCount[l.landlordId] = (listingCount[l.landlordId] || 0) + 1;
  for (const d of docs) docCount[owner[d.listingId]] = (docCount[owner[d.listingId]] || 0) + 1;

  res.json({
    users: rows.map((u) => ({
      ...serializeUser(u),
      listingCount: listingCount[u.id] || 0,
      documentCount: docCount[u.id] || 0,
    })),
  });
}

// PATCH /api/admin/users/:id/verify { isVerified } — the landlord verification workflow
// (MoM 31 Jul 2026, item 15). Verifying a landlord also marks their listings verified, since the
// badge on a listing means "the owner's documents were reviewed".
async function setUserVerified(req, res) {
  const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role !== 'landlord') return res.status(400).json({ error: 'Only landlords can be verified' });

  const isVerified = req.body.isVerified !== false;
  const now = new Date();
  await db.update(users).set({ isVerified, updatedAt: now }).where(eq(users.id, user.id));
  await db.update(listings).set({ isVerified, updatedAt: now }).where(eq(listings.landlordId, user.id));
  const [updated] = await db.select().from(users).where(eq(users.id, user.id));
  res.json({ user: serializeUser(updated) });
}

// GET /api/admin/inquiries — every enquiry, newest first, with the listing and landlord contact
// so the team can connect the tenant with the landlord.
async function listInquiries(req, res) {
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(500);
  const ids = [...new Set(rows.map((r) => r.listingId).filter(Boolean))];
  const related = ids.length ? await db.select().from(listings).where(inArray(listings.id, ids)) : [];
  const byId = Object.fromEntries(related.map((l) => [l.id, l]));

  res.json({
    inquiries: rows.map((r) => {
      const l = byId[r.listingId];
      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: l ? l.title : null,
        area: r.area,
        landlordName: l ? l.landlordName : null,
        landlordPhone: l ? l.landlordPhone : null,
        landlordWhatsApp: l ? l.landlordWhatsApp : null,
        name: r.name,
        phone: r.phone,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      };
    }),
  });
}

// GET /api/admin/feedback — feedback bubble submissions, newest first.
async function listFeedback(req, res) {
  const rows = await db.select().from(feedback).orderBy(desc(feedback.createdAt)).limit(500);
  res.json({ feedback: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
}

// PATCH /api/admin/feedback/:id { status: 'new' | 'reviewed' }
async function setFeedbackStatus(req, res) {
  const status = req.body.status === 'new' ? 'new' : 'reviewed';
  const [row] = await db.select().from(feedback).where(eq(feedback.id, req.params.id));
  if (!row) return res.status(404).json({ error: 'Feedback not found' });
  await db.update(feedback).set({ status }).where(eq(feedback.id, row.id));
  res.json({ feedback: { ...row, status, createdAt: row.createdAt.toISOString() } });
}

module.exports = {
  list,
  approve,
  reject,
  bulkApprove,
  update,
  remove,
  listUsers,
  setUserVerified,
  listInquiries,
  listFeedback,
  setFeedbackStatus,
};
