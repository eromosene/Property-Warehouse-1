const { eq, asc } = require('drizzle-orm');
const { db } = require('../db/client');
const { listings, listingImages, listingDocuments, users } = require('../db/schema');
const { serializeListing } = require('../utils/serialize');

// Loads a listing's images + ownership documents + owning landlord + that landlord's total
// listing count, and serializes it into the exact shape listings-data.js's
// DEFAULT_LISTINGS/saveListing use.
async function serializeListingRow(row) {
  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, row.id))
    .orderBy(asc(listingImages.sortOrder));
  const documents = await db.select().from(listingDocuments).where(eq(listingDocuments.listingId, row.id));
  const [landlord] = await db.select().from(users).where(eq(users.id, row.landlordId));
  const landlordListingsRows = await db.select().from(listings).where(eq(listings.landlordId, row.landlordId));
  return serializeListing(row, {
    images,
    documents,
    landlord: landlord || null,
    landlordListingsCount: landlordListingsRows.length,
  });
}

function serializeListingRows(rows) {
  return Promise.all(rows.map(serializeListingRow));
}

// Mirrors generateListingId() in listings-data.js ('LL' + base36 timestamp), with a random
// suffix added so two listings created in the same millisecond can't collide.
function generateListingId() {
  return 'LL' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
}

module.exports = { serializeListingRow, serializeListingRows, generateListingId };
