const router = require('express').Router();
const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings } = require('../db/schema');
const { serializeListingRows } = require('../services/listings.service');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/listings — current landlord's own listings, any status.
// Mirrors getLandlordListings(landlordEmail) in listings-data.js, used by landlord-dashboard.js.
router.get('/listings', (req, res) => {
  const rows = db.select().from(listings).where(eq(listings.landlordId, req.user.id)).all();
  res.json({ listings: serializeListingRows(rows) });
});

module.exports = router;
