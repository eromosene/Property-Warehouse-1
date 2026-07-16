const { eq, asc } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings, listingImages, listingDocuments, users } = require('../db/schema');
const { serializeListing } = require('../utils/serialize');

// Loads a listing's images + ownership documents + owning landlord + that landlord's total
// listing count, and serializes it into the exact shape listings-data.js's
// DEFAULT_LISTINGS/saveListing use.
function serializeListingRow(row) {
  const images = db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, row.id))
    .orderBy(asc(listingImages.sortOrder))
    .all();
  const documents = db.select().from(listingDocuments).where(eq(listingDocuments.listingId, row.id)).all();
  const landlord = db.select().from(users).where(eq(users.id, row.landlordId)).get();
  const landlordListingsCount = db.select().from(listings).where(eq(listings.landlordId, row.landlordId)).all().length;
  return serializeListing(row, { images, documents, landlord, landlordListingsCount });
}

function serializeListingRows(rows) {
  return rows.map(serializeListingRow);
}

// Mirrors generateListingId() in listings-data.js ('LL' + base36 timestamp), with a random
// suffix added so two listings created in the same millisecond can't collide.
function generateListingId() {
  return 'LL' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
}

module.exports = { serializeListingRow, serializeListingRows, generateListingId };
