const router = require('express').Router();
const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings } = require('../db/schema');
const { serializeListingRows } = require('../services/listings.service');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/listings — current landlord's own listings, any status.
// Mirrors getLandlordListings(landlordEmail) in listings-data.js, used by landlord-dashboard.js.
router.get(
  '/listings',
  asyncHandler(async (req, res) => {
    const rows = await db.select().from(listings).where(eq(listings.landlordId, req.user.id));
    res.json({ listings: await serializeListingRows(rows) });
  })
);

module.exports = router;
