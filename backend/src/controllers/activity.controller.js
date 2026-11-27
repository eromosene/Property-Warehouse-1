const { eq, inArray, desc } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings, inquiries, feedback } = require('../db/schema');

// Trims and caps free-text input from public forms; empty → null.
function clean(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

const FEEDBACK_CATEGORIES = ['feedback', 'complaint', 'suggestion', 'other'];

// POST /api/inquiries — public (optionalAuth). Called when a visitor opens the team WhatsApp chat
// about a listing. Records the enquiry; the conversation itself happens on WhatsApp.
async function createInquiry(req, res) {
  const listingId = clean(req.body.listingId, 100);
  if (!listingId) return res.status(400).json({ error: 'listingId is required' });

  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  await db.insert(inquiries).values({
    id: crypto.randomUUID(),
    listingId,
    area: listing.area,
    userId: req.user ? req.user.id : null,
    name: clean(req.body.name, 120),
    phone: clean(req.body.phone, 40),
    message: clean(req.body.message, 2000),
    channel: 'whatsapp',
    createdAt: new Date(),
  });
  res.status(201).json({ ok: true });
}

// POST /api/feedback — public (optionalAuth). The site's feedback bubble.
async function createFeedback(req, res) {
  const message = clean(req.body.message, 2000);
  if (!message) return res.status(400).json({ error: 'Please write a message' });
  const category = FEEDBACK_CATEGORIES.includes(req.body.category) ? req.body.category : 'other';

  await db.insert(feedback).values({
    id: crypto.randomUUID(),
    userId: req.user ? req.user.id : null,
    name: clean(req.body.name, 120) || (req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() : null),
    email: clean(req.body.email, 200) || (req.user ? req.user.email : null),
    category,
    message,
    page: clean(req.body.page, 300),
    status: 'new',
    createdAt: new Date(),
  });
  res.status(201).json({ ok: true });
}

// GET /api/landlord/inquiries — enquiry activity on the current landlord's listings.
// Tenant contact details are deliberately NOT returned: the team qualifies enquiries and
// connects serious tenants with the landlord (MoM 15 Sep 2026, Item 4).
async function landlordInquiries(req, res) {
  const own = await db.select().from(listings).where(eq(listings.landlordId, req.user.id));
  if (!own.length) return res.json({ total: 0, byListing: [], recent: [] });

  const titles = Object.fromEntries(own.map((l) => [l.id, l.title]));
  const rows = await db
    .select({ id: inquiries.id, listingId: inquiries.listingId, createdAt: inquiries.createdAt })
    .from(inquiries)
    .where(inArray(inquiries.listingId, own.map((l) => l.id)))
    .orderBy(desc(inquiries.createdAt));

  const counts = {};
  for (const r of rows) counts[r.listingId] = (counts[r.listingId] || 0) + 1;

  res.json({
    total: rows.length,
    byListing: own
      .map((l) => ({ listingId: l.id, title: l.title, count: counts[l.id] || 0 }))
      .sort((a, b) => b.count - a.count),
    recent: rows.slice(0, 10).map((r) => ({
      id: r.id,
      listingId: r.listingId,
      title: titles[r.listingId] || null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

module.exports = { createInquiry, createFeedback, landlordInquiries };
