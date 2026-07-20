// Seeds the database with:
//   1. One admin user (from ADMIN_EMAIL/ADMIN_PASSWORD in .env) — replaces the hardcoded
//      ADMIN_EMAIL/ADMIN_PASSWORD constants that used to live in admin.js.
//   2. Six landlord users, one per DEFAULT_LISTINGS seed listing in the current
//      listings-data.js, so every listing has a real, ownable User row (landlordId in the old
//      frontend data was just the string "default" — not a real multi-user account).
//   3. The same six listings, using the SAME ids (L001..L006) the frontend already links to
//      (e.g. listing-detail.html?id=L001), so nothing that currently deep-links to those ids
//      breaks once the frontend is wired to this API.
//
// Idempotent — safe to re-run; skips rows that already exist by email / id.
//
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { db, pool } = require('./client');
const { users, listings, listingImages } = require('./schema');

const SEED_LANDLORD_PASSWORD = 'SeedLandlord2026!'; // dev-only login for all 6 seed landlords

// Mirrors DEFAULT_LISTINGS in listings-data.js exactly (field-for-field) so the seeded data
// matches what the static frontend currently shows.
const DEFAULT_LISTINGS = [
  {
    id: 'L001',
    landlordName: 'Emeka Okafor',
    landlordEmail: 'emeka.okafor@seed.propertywarehouse.ng',
    landlordPhone: '2348012345678',
    landlordWhatsApp: '2348012345678',
    landlordSince: '2021',
    landlordVerified: true,
    title: 'Modern 2-Bedroom Flat',
    area: 'Yaba',
    lga: 'Lagos Mainland',
    address: '14 Herbert Macaulay Way, Yaba, Lagos',
    type: '2 Bedroom',
    rentPerYear: 800000,
    cautionFee: 400000,
    serviceCharge: 100000,
    isVerified: true,
    isMonthly: true,
    beds: 2,
    baths: 2,
    amenities: ['Water', 'Parking', 'Security'],
    description:
      'Beautifully finished 2-bedroom flat in the heart of Yaba. Walking distance to UNILAG and Yaba Tech. Perfect for young professionals.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    views: 342,
    createdAt: '2025-01-15',
  },
  {
    id: 'L002',
    landlordName: 'Ngozi Adeyemi',
    landlordEmail: 'ngozi.adeyemi@seed.propertywarehouse.ng',
    landlordPhone: '2348023456789',
    landlordWhatsApp: '2348023456789',
    landlordSince: '2022',
    landlordVerified: false,
    title: 'Self-Contain Studio',
    area: 'Surulere',
    lga: 'Surulere',
    address: '22 Bode Thomas Street, Surulere, Lagos',
    type: 'Self-contain',
    rentPerYear: 350000,
    cautionFee: 350000,
    serviceCharge: 50000,
    isVerified: false,
    isMonthly: false,
    beds: 1,
    baths: 1,
    amenities: ['Water', 'Security'],
    description:
      'Cozy self-contain studio in a quiet neighbourhood. Ideal for singles seeking an affordable option in Surulere.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
    ],
    views: 189,
    createdAt: '2025-02-01',
  },
  {
    id: 'L003',
    landlordName: 'Babatunde Fashola',
    landlordEmail: 'babatunde.fashola@seed.propertywarehouse.ng',
    landlordPhone: '2348034567890',
    landlordWhatsApp: '2348034567890',
    landlordSince: '2019',
    landlordVerified: true,
    title: 'Luxury 3-Bedroom Flat',
    area: 'Lekki Phase 1',
    lga: 'Eti-Osa',
    address: '5 Admiralty Way, Lekki Phase 1, Lagos',
    type: '3 Bedroom',
    rentPerYear: 3500000,
    cautionFee: 1750000,
    serviceCharge: 500000,
    isVerified: true,
    isMonthly: true,
    beds: 3,
    baths: 3,
    amenities: ['Water', 'Parking', 'Security', 'Generator', 'AC'],
    description:
      'Premium 3-bedroom apartment in prestigious Lekki Phase 1. Fully serviced with 24/7 security, swimming pool access, and standby generator.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    views: 612,
    createdAt: '2025-01-08',
  },
  {
    id: 'L004',
    landlordName: 'Chioma Nwosu',
    landlordEmail: 'chioma.nwosu@seed.propertywarehouse.ng',
    landlordPhone: '2348045678901',
    landlordWhatsApp: '2348045678901',
    landlordSince: '2023',
    landlordVerified: true,
    title: '1-Bedroom Apartment',
    area: 'Gbagada',
    lga: 'Lagos Mainland',
    address: '9 Gbagada Express Way, Gbagada, Lagos',
    type: '1 Bedroom',
    rentPerYear: 600000,
    cautionFee: 300000,
    serviceCharge: 80000,
    isVerified: true,
    isMonthly: false,
    beds: 1,
    baths: 1,
    amenities: ['Water', 'Parking'],
    description:
      'Clean 1-bedroom apartment in calm Gbagada neighbourhood. Easy access to the Gbagada-Oworonshoki Expressway.',
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    views: 274,
    createdAt: '2025-02-20',
  },
  {
    id: 'L005',
    landlordName: 'Funke Balogun',
    landlordEmail: 'funke.balogun@seed.propertywarehouse.ng',
    landlordPhone: '2348067890123',
    landlordWhatsApp: '2348067890123',
    landlordSince: '2020',
    landlordVerified: true,
    title: '2-Bedroom Terrace',
    area: 'Ajah',
    lga: 'Eti-Osa',
    address: 'Coastal Estate Road, Ajah, Lagos',
    type: '2 Bedroom',
    rentPerYear: 1200000,
    cautionFee: 600000,
    serviceCharge: 150000,
    isVerified: true,
    isMonthly: true,
    beds: 2,
    baths: 2,
    amenities: ['Water', 'Parking', 'Security', 'Generator'],
    description:
      'Modern 2-bedroom terrace in a gated estate in Ajah. Close to Shoprite Mall and Abraham Adesanya roundabout.',
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    ],
    views: 398,
    createdAt: '2025-01-25',
  },
  {
    id: 'L006',
    landlordName: 'Segun Adeola',
    landlordEmail: 'segun.adeola@seed.propertywarehouse.ng',
    landlordPhone: '2348078901234',
    landlordWhatsApp: '2348078901234',
    landlordSince: '2018',
    landlordVerified: true,
    title: '3-Bedroom Duplex',
    area: 'Magodo Phase 2',
    lga: 'Ikeja',
    address: 'Plot 12, Shangisha Road, Magodo GRA Phase 2, Lagos',
    type: 'Duplex',
    rentPerYear: 2500000,
    cautionFee: 1250000,
    serviceCharge: 300000,
    isVerified: true,
    isMonthly: true,
    beds: 3,
    baths: 3,
    amenities: ['Water', 'Parking', 'Security', 'Generator', 'AC'],
    description:
      'Executive 3-bedroom duplex in Magodo GRA Phase 2. Spacious compound, BQ inclusive, 24/7 security.',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
      'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    ],
    views: 521,
    createdAt: '2025-01-05',
  },
];

function slugToNames(fullName) {
  const [firstName, ...rest] = fullName.split(' ');
  return { firstName, lastName: rest.join(' ') || firstName };
}

async function upsertUser({ email, passwordHash, role, firstName, lastName, phone, isVerified, joinedDate }) {
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return existing;
  const now = new Date();
  const row = {
    id: crypto.randomUUID(),
    role,
    firstName,
    lastName,
    email,
    phone: phone || null,
    passwordHash,
    isVerified: !!isVerified,
    joinedDate: joinedDate || now,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(users).values(row);
  return row;
}

async function main() {
  console.log('Seeding database...');

  // 1. Admin user — no fallback: a guessable default admin account is not something to ship,
  // even for a dev seed script.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding — refusing to create a default/guessable admin account.');
    process.exit(1);
  }
  const [adminExisting] = await db.select().from(users).where(eq(users.email, adminEmail));
  if (!adminExisting) {
    await upsertUser({
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: 'admin',
      firstName: 'Technology',
      lastName: 'Integration Group',
    });
    console.log(`  Created admin user: ${adminEmail}`);
  } else {
    console.log(`  Admin user already exists: ${adminEmail}`);
  }

  // 2 & 3. Seed landlords + their listings
  const seedLandlordHash = bcrypt.hashSync(SEED_LANDLORD_PASSWORD, 10);
  for (const seed of DEFAULT_LISTINGS) {
    const { firstName, lastName } = slugToNames(seed.landlordName);
    const landlord = await upsertUser({
      email: seed.landlordEmail,
      passwordHash: seedLandlordHash,
      role: 'landlord',
      firstName,
      lastName,
      phone: seed.landlordPhone,
      isVerified: seed.landlordVerified,
      joinedDate: new Date(`${seed.landlordSince}-01-01`),
    });

    const [existingListing] = await db.select().from(listings).where(eq(listings.id, seed.id));
    if (existingListing) {
      console.log(`  Listing ${seed.id} already exists, skipping`);
      continue;
    }

    const createdAt = new Date(seed.createdAt);
    await db.insert(listings).values({
      id: seed.id,
      landlordId: landlord.id,
      landlordName: seed.landlordName,
      landlordPhone: seed.landlordPhone,
      landlordWhatsApp: seed.landlordWhatsApp,
      title: seed.title,
      area: seed.area,
      lga: seed.lga,
      address: seed.address,
      type: seed.type,
      rentPerYear: seed.rentPerYear,
      cautionFee: seed.cautionFee,
      serviceCharge: seed.serviceCharge,
      isVerified: seed.isVerified,
      isMonthly: seed.isMonthly,
      beds: seed.beds,
      baths: seed.baths,
      amenitiesJson: JSON.stringify(seed.amenities),
      description: seed.description,
      views: seed.views,
      status: 'active',
      ownershipDocTypesJson: '[]',
      createdAt,
      updatedAt: createdAt,
    });

    for (const [i, url] of seed.images.entries()) {
      await db.insert(listingImages).values({ id: crypto.randomUUID(), listingId: seed.id, url, sortOrder: i, createdAt });
    }

    console.log(`  Created listing ${seed.id} (${seed.title}) owned by ${seed.landlordEmail}`);
  }

  console.log('\nSeed complete.');
  console.log(`Admin login:    ${adminEmail} / ${adminPassword}`);
  console.log(`Seed landlord login (any of the 6 above): <their email> / ${SEED_LANDLORD_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
