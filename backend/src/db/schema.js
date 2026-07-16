// Drizzle ORM schema for the Property Warehouse backend (Phase 1: auth + listings + uploads).
//
// Dev default is SQLite via better-sqlite3 (zero external setup — no Docker/Postgres install
// needed to run this locally). BACKEND-REQUIREMENTS.md recommends PostgreSQL for production;
// switching later means swapping the driver in src/db/client.js (drizzle-orm/node-postgres or
// drizzle-orm/postgres-js instead of drizzle-orm/better-sqlite3) and re-generating migrations
// with dialect: 'postgresql' in drizzle.config.js. Scalar arrays (amenities, ownershipDocTypes)
// are deliberately stored as JSON text columns instead of native array columns so the schema
// itself doesn't need to change on that switch.
const { sqliteTable, text, integer } = require('drizzle-orm/sqlite-core');

const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['tenant', 'landlord', 'admin'] }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),

  // tenant-only signup fields (auth.js #tenant-signup)
  area: text('area'),
  budget: text('budget'),

  // landlord-only signup fields (auth.js #landlord-signup)
  propType: text('prop_type'),
  lga: text('lga'),

  // landlord verification badge, drives listing.landlordVerified in the API response
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),

  joinedDate: integer('joined_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  landlordId: text('landlord_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Denormalized landlord contact fields, collected on the create-listing.html "Contact Info"
  // step (contact name / WhatsApp / phone) — matches listings-data.js, where each listing
  // snapshot carries its own contact fields rather than joining the user record for these.
  landlordName: text('landlord_name').notNull(),
  landlordPhone: text('landlord_phone').notNull(),
  landlordWhatsApp: text('landlord_whatsapp').notNull(),

  title: text('title').notNull(),
  area: text('area').notNull(),
  lga: text('lga').notNull(),
  address: text('address').notNull(),
  type: text('type').notNull(),

  rentPerYear: integer('rent_per_year').notNull(),
  cautionFee: integer('caution_fee').notNull(),
  serviceCharge: integer('service_charge').notNull(),
  // totalMoveIn is NOT a column — it's derived (rentPerYear + cautionFee + serviceCharge) in
  // the API response serializer, never trusted from the client.

  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  isMonthly: integer('is_monthly', { mode: 'boolean' }).notNull().default(false),

  beds: integer('beds').notNull(),
  baths: integer('baths').notNull(),

  // JSON-encoded string[], e.g. '["Water","Parking","Security"]'
  amenitiesJson: text('amenities_json').notNull().default('[]'),

  description: text('description').notNull(),

  views: integer('views').notNull().default(0),
  status: text('status', { enum: ['pending', 'active', 'flagged', 'rejected'] })
    .notNull()
    .default('pending'),

  // JSON-encoded string[] of document type labels, e.g. '["C of O","Survey Plan"]'
  ownershipDocTypesJson: text('ownership_doc_types_json').notNull().default('[]'),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

const listingImages = sqliteTable('listing_images', {
  id: text('id').primaryKey(),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

const listingDocuments = sqliteTable('listing_documents', {
  id: text('id').primaryKey(),
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  docType: text('doc_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

module.exports = { users, listings, listingImages, listingDocuments };
