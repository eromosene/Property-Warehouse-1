const { and, eq, or, like, lte, inArray } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings, listingImages, listingDocuments } = require('../db/schema');
const { serializeListingRow, serializeListingRows, generateListingId } = require('../services/listings.service');

const SORTERS = {
  'price-asc': (a, b) => a.rentPerYear - b.rentPerYear,
  'price-desc': (a, b) => b.rentPerYear - a.rentPerYear,
  views: (a, b) => b.views - a.views,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

function splitCsv(value) {
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// GET /api/listings — public browse/search/filter, mirrors listings.js's applyFilters().
// Query params: area, type, maxRent, amenities, verifiedOnly, monthlyOnly, q, sort, page, limit
function list(req, res) {
  const { area, type, maxRent, amenities, verifiedOnly, monthlyOnly, q, sort, page, limit } = req.query;

  const conditions = [eq(listings.status, 'active')];

  if (area) conditions.push(inArray(listings.area, splitCsv(area)));
  if (type) conditions.push(inArray(listings.type, splitCsv(type)));
  if (maxRent && !Number.isNaN(Number(maxRent))) conditions.push(lte(listings.rentPerYear, Number(maxRent)));
  if (verifiedOnly === 'true') conditions.push(eq(listings.isVerified, true));
  if (monthlyOnly === 'true') conditions.push(eq(listings.isMonthly, true));
  if (q) {
    const needle = `%${q}%`;
    conditions.push(
      or(
        like(listings.title, needle),
        like(listings.area, needle),
        like(listings.type, needle),
        like(listings.description, needle)
      )
    );
  }

  let rows = db
    .select()
    .from(listings)
    .where(and(...conditions))
    .all();

  // Amenities require ALL selected amenities to be present — done in JS since amenities are
  // stored as a JSON column, not a queryable column (see schema.js header comment).
  if (amenities) {
    const required = splitCsv(amenities);
    rows = rows.filter((r) => {
      const has = JSON.parse(r.amenitiesJson || '[]');
      return required.every((a) => has.includes(a));
    });
  }

  rows.sort(SORTERS[sort] || SORTERS.newest);

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 8);
  const total = rows.length;
  const pageRows = rows.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    listings: serializeListingRows(pageRows),
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

// GET /api/listings/:id — public detail view. Non-active listings are only visible to their
// owning landlord or an admin (uses optionalAuth so req.user may be null).
function getById(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const isOwner = req.user && req.user.id === row.landlordId;
  const isAdmin = req.user && req.user.role === 'admin';
  if (row.status !== 'active' && !isOwner && !isAdmin) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  res.json({ listing: serializeListingRow(row) });
}

// GET /api/listings/:id/similar — "Similar in <area>" section on listing-detail.html
function similar(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const rows = db
    .select()
    .from(listings)
    .where(and(eq(listings.area, row.area), eq(listings.status, 'active')))
    .all()
    .filter((r) => r.id !== row.id)
    .slice(0, 2);

  res.json({ listings: serializeListingRows(rows) });
}

// POST /api/listings/:id/view — increments the view counter shown on listing cards/detail.
function incrementView(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const views = row.views + 1;
  db.update(listings).set({ views }).where(eq(listings.id, row.id)).run();
  res.json({ views });
}

const REQUIRED_CREATE_FIELDS = [
  'title',
  'area',
  'lga',
  'address',
  'type',
  'beds',
  'baths',
  'rentPerYear',
  'cautionFee',
  'serviceCharge',
  'description',
  'landlordName',
  'landlordPhone',
  'landlordWhatsApp',
];

// POST /api/listings — landlord-only, mirrors create-listing.js's publishListing()/saveListing().
// New listings always start 'pending', matching saveListing()'s existing default-to-pending behavior.
function create(req, res) {
  const body = req.body;
  for (const field of REQUIRED_CREATE_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  const now = new Date();
  const row = {
    id: generateListingId(),
    landlordId: req.user.id,
    landlordName: body.landlordName,
    landlordPhone: body.landlordPhone,
    landlordWhatsApp: body.landlordWhatsApp,
    title: body.title,
    area: body.area,
    lga: body.lga,
    address: body.address,
    type: body.type,
    rentPerYear: Number(body.rentPerYear),
    cautionFee: Number(body.cautionFee),
    serviceCharge: Number(body.serviceCharge),
    isVerified: false,
    isMonthly: !!body.isMonthly,
    beds: Number(body.beds),
    baths: Number(body.baths),
    amenitiesJson: JSON.stringify(Array.isArray(body.amenities) ? body.amenities : []),
    description: body.description,
    views: 0,
    status: 'pending',
    ownershipDocTypesJson: JSON.stringify(Array.isArray(body.ownershipDocTypes) ? body.ownershipDocTypes : []),
    createdAt: now,
    updatedAt: now,
  };
  db.insert(listings).values(row).run();

  const imageUrls = Array.isArray(body.images) ? body.images : [];
  imageUrls.forEach((url, i) => {
    db.insert(listingImages)
      .values({ id: crypto.randomUUID(), listingId: row.id, url, sortOrder: i, createdAt: now })
      .run();
  });

  // Ownership document URLs (from POST /api/uploads/documents) — previously accepted nowhere,
  // so create-listing.js's uploaded ownership docs were silently discarded. docType is left
  // null since the frontend doesn't pair individual files with a specific type label; the
  // separately-submitted ownershipDocTypes list already captures which types the landlord says
  // they have.
  const documentUrls = Array.isArray(body.documents) ? body.documents : [];
  documentUrls.forEach((url) => {
    db.insert(listingDocuments)
      .values({ id: crypto.randomUUID(), listingId: row.id, url, docType: null, createdAt: now })
      .run();
  });

  res.status(201).json({ listing: serializeListingRow(row) });
}

const OWNER_EDITABLE_FIELDS = [
  'title',
  'area',
  'lga',
  'address',
  'type',
  'rentPerYear',
  'cautionFee',
  'serviceCharge',
  'beds',
  'baths',
  'description',
  'isMonthly',
  'landlordName',
  'landlordPhone',
  'landlordWhatsApp',
];

// PATCH /api/listings/:id — landlord editing their own listing. Not present in the current
// frontend (create-listing.js only ever creates), but listed in BACKEND-REQUIREMENTS.md §2 as
// a needed addition. Editing an already-active listing sends it back to 'pending' for re-review.
function updateOwn(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });
  if (row.landlordId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const updates = {};
  for (const field of OWNER_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (req.body.amenities !== undefined) {
    updates.amenitiesJson = JSON.stringify(req.body.amenities);
  }
  updates.updatedAt = new Date();
  if (row.status === 'active') updates.status = 'pending';

  db.update(listings).set(updates).where(eq(listings.id, row.id)).run();
  const updated = db.select().from(listings).where(eq(listings.id, row.id)).get();
  res.json({ listing: serializeListingRow(updated) });
}

// DELETE /api/listings/:id — landlord deleting their own listing, mirrors deleteListing() in
// listings-data.js as called from landlord-dashboard.js.
function deleteOwn(req, res) {
  const row = db.select().from(listings).where(eq(listings.id, req.params.id)).get();
  if (!row) return res.status(404).json({ error: 'Listing not found' });
  if (row.landlordId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.delete(listings).where(eq(listings.id, row.id)).run();
  res.status(204).end();
}

module.exports = { list, getById, similar, incrementView, create, updateOwn, deleteOwn };
