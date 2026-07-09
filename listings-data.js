const DEFAULT_LISTINGS = [
  {
    id: "L001",
    landlordId: "default",
    landlordName: "Emeka Okafor",
    landlordPhone: "2348012345678",
    landlordWhatsApp: "2348012345678",
    landlordSince: "2021",
    landlordVerified: true,
    landlordListings: 3,
    title: "Modern 2-Bedroom Flat",
    area: "Yaba",
    lga: "Lagos Mainland",
    address: "14 Herbert Macaulay Way, Yaba, Lagos",
    type: "2 Bedroom",
    rentPerYear: 800000,
    cautionFee: 400000,
    serviceCharge: 100000,
    totalMoveIn: 1300000,
    isVerified: true,
    isMonthly: true,
    beds: 2,
    baths: 2,
    amenities: ["Water", "Parking", "Security"],
    description: "Beautifully finished 2-bedroom flat in the heart of Yaba. Walking distance to UNILAG and Yaba Tech. Perfect for young professionals.",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
    ],
    views: 342,
    createdAt: "2025-01-15"
  },
  {
    id: "L002",
    landlordId: "default",
    landlordName: "Ngozi Adeyemi",
    landlordPhone: "2348023456789",
    landlordWhatsApp: "2348023456789",
    landlordSince: "2022",
    landlordVerified: false,
    landlordListings: 1,
    title: "Self-Contain Studio",
    area: "Surulere",
    lga: "Surulere",
    address: "22 Bode Thomas Street, Surulere, Lagos",
    type: "Self-contain",
    rentPerYear: 350000,
    cautionFee: 350000,
    serviceCharge: 50000,
    totalMoveIn: 750000,
    isVerified: false,
    isMonthly: false,
    beds: 1,
    baths: 1,
    amenities: ["Water", "Security"],
    description: "Cozy self-contain studio in a quiet neighbourhood. Ideal for singles seeking an affordable option in Surulere.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80"
    ],
    views: 189,
    createdAt: "2025-02-01"
  },
  {
    id: "L003",
    landlordId: "default",
    landlordName: "Babatunde Fashola",
    landlordPhone: "2348034567890",
    landlordWhatsApp: "2348034567890",
    landlordSince: "2019",
    landlordVerified: true,
    landlordListings: 5,
    title: "Luxury 3-Bedroom Flat",
    area: "Lekki Phase 1",
    lga: "Eti-Osa",
    address: "5 Admiralty Way, Lekki Phase 1, Lagos",
    type: "3 Bedroom",
    rentPerYear: 3500000,
    cautionFee: 1750000,
    serviceCharge: 500000,
    totalMoveIn: 5750000,
    isVerified: true,
    isMonthly: true,
    beds: 3,
    baths: 3,
    amenities: ["Water", "Parking", "Security", "Generator", "AC"],
    description: "Premium 3-bedroom apartment in prestigious Lekki Phase 1. Fully serviced with 24/7 security, swimming pool access, and standby generator.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
    ],
    views: 612,
    createdAt: "2025-01-08"
  },
  {
    id: "L004",
    landlordId: "default",
    landlordName: "Chioma Nwosu",
    landlordPhone: "2348045678901",
    landlordWhatsApp: "2348045678901",
    landlordSince: "2023",
    landlordVerified: true,
    landlordListings: 2,
    title: "1-Bedroom Apartment",
    area: "Gbagada",
    lga: "Lagos Mainland",
    address: "9 Gbagada Express Way, Gbagada, Lagos",
    type: "1 Bedroom",
    rentPerYear: 600000,
    cautionFee: 300000,
    serviceCharge: 80000,
    totalMoveIn: 980000,
    isVerified: true,
    isMonthly: false,
    beds: 1,
    baths: 1,
    amenities: ["Water", "Parking"],
    description: "Clean 1-bedroom apartment in calm Gbagada neighbourhood. Easy access to the Gbagada-Oworonshoki Expressway.",
    images: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
    ],
    views: 274,
    createdAt: "2025-02-20"
  },
  {
    id: "L005",
    landlordId: "default",
    landlordName: "Funke Balogun",
    landlordPhone: "2348067890123",
    landlordWhatsApp: "2348067890123",
    landlordSince: "2020",
    landlordVerified: true,
    landlordListings: 4,
    title: "2-Bedroom Terrace",
    area: "Ajah",
    lga: "Eti-Osa",
    address: "Coastal Estate Road, Ajah, Lagos",
    type: "2 Bedroom",
    rentPerYear: 1200000,
    cautionFee: 600000,
    serviceCharge: 150000,
    totalMoveIn: 1950000,
    isVerified: true,
    isMonthly: true,
    beds: 2,
    baths: 2,
    amenities: ["Water", "Parking", "Security", "Generator"],
    description: "Modern 2-bedroom terrace in a gated estate in Ajah. Close to Shoprite Mall and Abraham Adesanya roundabout.",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
    ],
    views: 398,
    createdAt: "2025-01-25"
  },
  {
    id: "L006",
    landlordId: "default",
    landlordName: "Segun Adeola",
    landlordPhone: "2348078901234",
    landlordWhatsApp: "2348078901234",
    landlordSince: "2018",
    landlordVerified: true,
    landlordListings: 6,
    title: "3-Bedroom Duplex",
    area: "Magodo Phase 2",
    lga: "Ikeja",
    address: "Plot 12, Shangisha Road, Magodo GRA Phase 2, Lagos",
    type: "Duplex",
    rentPerYear: 2500000,
    cautionFee: 1250000,
    serviceCharge: 300000,
    totalMoveIn: 4050000,
    isVerified: true,
    isMonthly: true,
    beds: 3,
    baths: 3,
    amenities: ["Water", "Parking", "Security", "Generator", "AC"],
    description: "Executive 3-bedroom duplex in Magodo GRA Phase 2. Spacious compound, BQ inclusive, 24/7 security.",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80",
      "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80"
    ],
    views: 521,
    createdAt: "2025-01-05"
  }
];

function getAllListings() {
  const landlordListings = JSON.parse(localStorage.getItem('pw_listings') || '[]');
  // Exclude pending/flagged/rejected listings from public view — admin must approve first
  const approvedLandlordListings = landlordListings.filter(l => !l.status || l.status === 'active');
  return [...DEFAULT_LISTINGS, ...approvedLandlordListings];
}

function getAllListingsAdmin() {
  // Returns ALL listings including pending/flagged/rejected — for admin use only
  const landlordListings = JSON.parse(localStorage.getItem('pw_listings') || '[]');
  return [...DEFAULT_LISTINGS, ...landlordListings];
}

function getListingById(id) {
  return getAllListings().find(l => l.id === id);
}

function saveListing(listing) {
  const existing = JSON.parse(localStorage.getItem('pw_listings') || '[]');
  // New landlord-created listings default to 'pending' — admin must approve before going live
  if (!listing.status) listing.status = 'pending';
  existing.push(listing);
  localStorage.setItem('pw_listings', JSON.stringify(existing));
}

function deleteListing(id) {
  const existing = JSON.parse(localStorage.getItem('pw_listings') || '[]');
  const updated = existing.filter(l => l.id !== id);
  localStorage.setItem('pw_listings', JSON.stringify(updated));
}

function getLandlordListings(landlordEmail) {
  const all = JSON.parse(localStorage.getItem('pw_listings') || '[]');
  return all.filter(l => l.landlordId === landlordEmail);
}

function formatNaira(amount) {
  return '\u20a6' + Number(amount).toLocaleString('en-NG');
}

function generateListingId() {
  return 'LL' + Date.now().toString(36).toUpperCase();
}

/* ── Tenant Favourites ── */
function getFavourites() {
  return JSON.parse(localStorage.getItem('pw_favourites') || '[]');
}
function isFavourite(listingId) {
  return getFavourites().includes(listingId);
}
function toggleFavourite(listingId) {
  const favs = getFavourites();
  const idx  = favs.indexOf(listingId);
  if (idx > -1) favs.splice(idx, 1);
  else favs.unshift(listingId);
  localStorage.setItem('pw_favourites', JSON.stringify(favs));
  return idx === -1;
}
function getSavedListings() {
  const favs = getFavourites();
  return getAllListings().filter(l => favs.includes(l.id));
}

/* ── Inquiries ── */
function getInquiries() {
  return JSON.parse(localStorage.getItem('pw_inquiries') || '[]');
}
function addInquiry(inquiry) {
  const list = getInquiries();
  list.unshift({ ...inquiry, sentAt: new Date().toISOString() });
  if (list.length > 50) list.length = 50;
  localStorage.setItem('pw_inquiries', JSON.stringify(list));
}
