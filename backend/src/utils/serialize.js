function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

// Matches the shape auth.js currently writes to localStorage.pw_current_user (minus password).
function serializeUser(user) {
  return {
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    area: user.area,
    budget: user.budget,
    propType: user.propType,
    lga: user.lga,
    isVerified: user.isVerified,
    joinedDate: toIso(user.joinedDate),
  };
}

// Matches the listing object shape from listings-data.js (DEFAULT_LISTINGS / saveListing),
// so the frontend needs minimal changes once it's wired to this API.
//
// `landlord` is the joined User row (owner of the listing) — landlordVerified/landlordSince
// are computed live from it rather than trusted/duplicated on the listing row, so a landlord's
// verification badge updates everywhere at once instead of needing a backfill per listing.
function serializeListing(listing, { images = [], documents = [], landlord = null, landlordListingsCount = null } = {}) {
  return {
    id: listing.id,
    landlordId: listing.landlordId,
    landlordName: listing.landlordName,
    landlordPhone: listing.landlordPhone,
    landlordWhatsApp: listing.landlordWhatsApp,
    landlordSince: landlord ? String(new Date(landlord.joinedDate).getFullYear()) : undefined,
    landlordVerified: landlord ? !!landlord.isVerified : false,
    landlordListings: landlordListingsCount,
    title: listing.title,
    area: listing.area,
    lga: listing.lga,
    address: listing.address,
    type: listing.type,
    rentPerYear: listing.rentPerYear,
    cautionFee: listing.cautionFee,
    serviceCharge: listing.serviceCharge,
    totalMoveIn: listing.rentPerYear + listing.cautionFee + listing.serviceCharge,
    isVerified: !!listing.isVerified,
    isMonthly: !!listing.isMonthly,
    beds: listing.beds,
    baths: listing.baths,
    amenities: JSON.parse(listing.amenitiesJson || '[]'),
    description: listing.description,
    images: images.map((img) => img.url),
    views: listing.views,
    status: listing.status,
    ownershipDocTypes: JSON.parse(listing.ownershipDocTypesJson || '[]'),
    // Document URLs themselves are intentionally not exposed here — ownership documents are
    // private (verification-only), unlike listing photos. Only the count is public, matching
    // the original frontend's `ownershipDocCount` field.
    ownershipDocCount: documents.length,
    createdAt: toIso(listing.createdAt),
  };
}

module.exports = { serializeUser, serializeListing };
