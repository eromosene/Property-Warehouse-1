/* ══════════════════════════════════════════════════
   DEMO DATA — Property Warehouse Admin Dashboard
   This file contains STATIC mock data for Demo Mode.
   It NEVER reads from or writes to localStorage.
   Toggle via the "Demo Mode" switch in the admin header.
══════════════════════════════════════════════════ */

const DEMO_DATA = {
  stats: {
    totalUsers: 1842,
    activeListings: 347,
    totalInquiries: 4291,
    platformRevenue: 8450000,
    openComplaints: 7,
    urgentComplaints: 3,
    totalTenants: 1245,
    totalLandlords: 597,
    verifiedListings: 298,
    totalReviews: 342,
    avgResponseTime: "2.4 hrs",
    platformUptime: "99.9%"
  },

  users: {
    tenants: [
      { id: "T001", firstName: "Amaka", lastName: "Nwosu", email: "amaka.nwosu@gmail.com", phone: "0803 456 7890", area: "Lekki Phase 1", budgetRange: "₦1M–₦2M", joinDate: "2025-01-15", savedListings: 8, status: "active" },
      { id: "T002", firstName: "Tunde", lastName: "Adebayo", email: "tunde.adebayo@gmail.com", phone: "0706 234 5678", area: "Yaba", budgetRange: "₦500K–₦1M", joinDate: "2025-01-18", savedListings: 5, status: "active" },
      { id: "T003", firstName: "Kemi", lastName: "Balogun", email: "kemi.balogun@outlook.com", phone: "0905 678 9012", area: "Ajah", budgetRange: "₦1M–₦2M", joinDate: "2025-02-03", savedListings: 12, status: "active" },
      { id: "T004", firstName: "Femi", lastName: "Adesanya", email: "femi.adesanya@yahoo.com", phone: "0812 345 6789", area: "Surulere", budgetRange: "₦300K–₦500K", joinDate: "2025-02-10", savedListings: 3, status: "active" },
      { id: "T005", firstName: "Bola", lastName: "Adekunle", email: "bola.adekunle@gmail.com", phone: "0912 456 7890", area: "Gbagada", budgetRange: "₦500K–₦1M", joinDate: "2025-02-14", savedListings: 7, status: "suspended" },
      { id: "T006", firstName: "Ngozi", lastName: "Obi", email: "ngozi.obi@gmail.com", phone: "0801 234 5678", area: "Magodo", budgetRange: "₦2M–₦3M", joinDate: "2025-02-20", savedListings: 9, status: "active" },
      { id: "T007", firstName: "Sade", lastName: "Martins", email: "sade.martins@gmail.com", phone: "0817 654 3210", area: "Ikoyi", budgetRange: "₦3M+", joinDate: "2025-03-01", savedListings: 4, status: "active" },
      { id: "T008", firstName: "David", lastName: "Okonkwo", email: "david.okonkwo@gmail.com", phone: "0801 234 5678", area: "Victoria Island", budgetRange: "₦2M–₦3M", joinDate: "2025-03-05", savedListings: 6, status: "active" }
    ],
    landlords: [
      { id: "LL001", firstName: "David", lastName: "Okonkwo", email: "david.okonkwo@landlord.com", phone: "0801 234 5678", lga: "Eti-Osa", listingsCount: 8, joinDate: "2025-01-10", verified: true, status: "active" },
      { id: "LL002", firstName: "Kemi", lastName: "Balogun", email: "kemi.balogun@landlord.com", phone: "0905 678 9012", lga: "Surulere", listingsCount: 6, joinDate: "2025-01-12", verified: true, status: "active" },
      { id: "LL003", firstName: "Adeyemi", lastName: "Johnson", email: "adeyemi.johnson@landlord.com", phone: "0803 111 2222", lga: "Lagos Mainland", listingsCount: 5, joinDate: "2025-01-20", verified: true, status: "active" },
      { id: "LL004", firstName: "Amaka", lastName: "Nwosu", email: "amaka.nwosu@landlord.com", phone: "0803 456 7890", lga: "Ibeju-Lekki", listingsCount: 4, joinDate: "2025-02-01", verified: false, status: "active" },
      { id: "LL005", firstName: "Tunde", lastName: "Adebayo", email: "tunde.adebayo@landlord.com", phone: "0706 234 5678", lga: "Ikeja", listingsCount: 3, joinDate: "2025-02-15", verified: true, status: "active" }
    ]
  },

  listings: [
    { id: "DL001", title: "4 Bedroom Duplex", type: "Duplex", area: "Lekki Phase 1", lga: "Eti-Osa", landlordName: "David Okonkwo", landlordEmail: "david.okonkwo@landlord.com", rentPerYear: 3500000, status: "pending", views: 0, inquiries: 0, dateAdded: "2025-05-30", isVerified: false, images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80"] },
    { id: "DL002", title: "2 Bedroom Apartment", type: "2 Bedroom", area: "Yaba", lga: "Lagos Mainland", landlordName: "Kemi Balogun", landlordEmail: "kemi.balogun@landlord.com", rentPerYear: 1200000, status: "pending", views: 0, inquiries: 0, dateAdded: "2025-05-31", isVerified: false, images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"] },
    { id: "DL003", title: "Studio Apartment", type: "Self-contain", area: "Ajah", lga: "Eti-Osa", landlordName: "Sade Martins", landlordEmail: "sade.martins@landlord.com", rentPerYear: 800000, status: "pending", views: 0, inquiries: 0, dateAdded: "2025-06-01", isVerified: false, images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"] },
    { id: "DL004", title: "3 Bedroom Flat", type: "3 Bedroom", area: "Lekki Phase 1", lga: "Eti-Osa", landlordName: "Adeyemi Johnson", landlordEmail: "adeyemi.johnson@landlord.com", rentPerYear: 2800000, status: "active", views: 1890, inquiries: 214, dateAdded: "2025-01-08", isVerified: true, images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80"] },
    { id: "DL005", title: "4 Bedroom Terrace", type: "Terrace", area: "Lekki Phase 1", lga: "Eti-Osa", landlordName: "David Okonkwo", landlordEmail: "david.okonkwo@landlord.com", rentPerYear: 4500000, status: "active", views: 1890, inquiries: 214, dateAdded: "2025-01-05", isVerified: true, images: ["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=80"] },
    { id: "DL006", title: "2 Bedroom Flat", type: "2 Bedroom", area: "Yaba", lga: "Lagos Mainland", landlordName: "Kemi Balogun", landlordEmail: "kemi.balogun@landlord.com", rentPerYear: 950000, status: "active", views: 1420, inquiries: 187, dateAdded: "2025-01-15", isVerified: true, images: ["https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&q=80"] },
    { id: "DL007", title: "1 Bedroom Apartment", type: "1 Bedroom", area: "Ajah", lga: "Eti-Osa", landlordName: "Amaka Nwosu", landlordEmail: "amaka.nwosu@landlord.com", rentPerYear: 750000, status: "flagged", views: 340, inquiries: 28, dateAdded: "2025-02-10", isVerified: false, images: ["https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&q=80"] },
    { id: "DL008", title: "3 Bedroom Duplex", type: "Duplex", area: "Gbagada", lga: "Lagos Mainland", landlordName: "Tunde Adebayo", landlordEmail: "tunde.adebayo@landlord.com", rentPerYear: 1800000, status: "rejected", views: 0, inquiries: 0, dateAdded: "2025-02-20", isVerified: false, images: ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400&q=80"] }
  ],

  inquiries: [
    { id: "INQ001", name: "Amaka Nwosu", phone: "0803 456 7890", email: "amaka.nwosu@gmail.com", messagePreview: "Hi, is this apartment still available? I'm interested in scheduling a viewing.", listingTitle: "3 Bedroom Flat", listingId: "DL004", landlordName: "David Okonkwo", sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: "new", source: "website" },
    { id: "INQ002", name: "Tunde Adebayo", phone: "0706 234 5678", email: "tunde.adebayo@gmail.com", messagePreview: "Please I want to schedule a viewing for this property.", listingTitle: "2 Bedroom Apartment", listingId: "DL006", landlordName: "Kemi Balogun", sentAt: new Date(Date.now() - 3 * 3600000).toISOString(), status: "new", source: "whatsapp" },
    { id: "INQ003", name: "Kemi Balogun", phone: "0905 678 9012", email: "kemi.balogun@outlook.com", messagePreview: "What are the payment terms and when can I move in?", listingTitle: "4 Bedroom Duplex", listingId: "DL005", landlordName: "Adeyemi Johnson", sentAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: "read", source: "website" },
    { id: "INQ004", name: "Femi Adesanya", phone: "0812 345 6789", email: "femi.adesanya@yahoo.com", messagePreview: "Is the rent inclusive of service charge and other fees?", listingTitle: "Studio Apartment", listingId: "DL003", landlordName: "Sade Martins", sentAt: new Date(Date.now() - 6 * 3600000).toISOString(), status: "read", source: "website" },
    { id: "INQ005", name: "Bola Adekunle", phone: "0912 456 7890", email: "bola.adekunle@gmail.com", messagePreview: "Good evening, please can I get more pictures of the property?", listingTitle: "3 Bedroom Flat", listingId: "DL004", landlordName: "David Okonkwo", sentAt: new Date(Date.now() - 24 * 3600000).toISOString(), status: "replied", source: "whatsapp" },
    { id: "INQ006", name: "Ngozi Obi", phone: "0801 234 1234", email: "ngozi.obi@gmail.com", messagePreview: "Hello, is the property document available for review?", listingTitle: "2 Bedroom Flat", listingId: "DL006", landlordName: "Kemi Balogun", sentAt: new Date(Date.now() - 24 * 3600000).toISOString(), status: "replied", source: "direct" },
    { id: "INQ007", name: "Sade Martins", phone: "0817 654 3210", email: "sade.martins@gmail.com", messagePreview: "I like the property. What is the deposit requirement?", listingTitle: "4 Bedroom Terrace", listingId: "DL005", landlordName: "David Okonkwo", sentAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), status: "replied", source: "website" },
    { id: "INQ008", name: "David Okonkwo", phone: "0801 234 5678", email: "david.okonkwo@gmail.com", messagePreview: "Please I want to confirm if the property is still available.", listingTitle: "5 Bedroom House", listingId: "DL004", landlordName: "Adeyemi Johnson", sentAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), status: "closed", source: "referral" }
  ],

  feedback: [
    { id: "FB001", type: "complaint", name: "Amaka Nwosu", email: "amaka.nwosu@gmail.com", message: "The listing was already taken down when I got there. The landlord wasted my time.", page: "listing-detail.html", sentAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: "new", adminNote: "" },
    { id: "FB002", type: "suggestion", name: "Tunde Adebayo", email: "tunde.adebayo@gmail.com", message: "Add more filter options for rent payment frequency. Monthly vs annual is important for tenants.", page: "listings.html", sentAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: "in_review", adminNote: "" },
    { id: "FB003", type: "feedback", name: "Kemi Balogun", email: "kemi.balogun@outlook.com", message: "Great platform! Found my apartment quickly. The WhatsApp integration is very helpful.", page: "dashboard.html", sentAt: new Date(Date.now() - 24 * 3600000).toISOString(), status: "resolved", adminNote: "Positive feedback — shared with team." },
    { id: "FB004", type: "complaint", name: "Femi Adesanya", email: "femi.adesanya@yahoo.com", message: "I sent 3 inquiries but never got a response from the landlord. Please improve response tracking.", page: "listing-detail.html", sentAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), status: "new", adminNote: "" },
    { id: "FB005", type: "suggestion", name: "Bola Adekunle", email: "bola.adekunle@gmail.com", message: "Would be great to have a saved search feature so I get notified when new listings match my criteria.", page: "listings.html", sentAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), status: "in_review", adminNote: "" },
    { id: "FB006", type: "feedback", name: "Ngozi Obi", email: "ngozi.obi@gmail.com", message: "The heat map feature is brilliant! Very useful for comparing areas and prices visually.", page: "heatmap.html", sentAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), status: "resolved", adminNote: "" }
  ],

  verificationRequests: [
    { id: "VR001", landlordId: "LL004", name: "Amaka Nwosu", email: "amaka.nwosu@landlord.com", phone: "0803 456 7890", location: "Ibeju-Lekki, Lagos", propertyType: "Residential", appliedDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), documents: { govId: true, proofOfAddress: true, propertyOwnership: false }, status: "pending" },
    { id: "VR002", landlordId: "VL001", name: "Chioma Eze", email: "chioma.eze@landlord.com", phone: "0705 432 1098", location: "Surulere, Lagos", propertyType: "Residential", appliedDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), documents: { govId: true, proofOfAddress: true, propertyOwnership: true }, status: "pending" },
    { id: "VR003", landlordId: "VL002", name: "Emeka Okeke", email: "emeka.okeke@landlord.com", phone: "0901 234 5678", location: "Gbagada, Lagos", propertyType: "Residential", appliedDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), documents: { govId: true, proofOfAddress: false, propertyOwnership: true }, status: "pending" }
  ],

  verificationHistory: [
    { landlordName: "Babatunde Fashola", email: "b.fashola@landlord.com", action: "approved", date: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), admin: "Adeyemi Johnson", notes: "All documents verified and authentic." },
    { landlordName: "Ngozi Adeyemi", email: "ngozi.adeyemi@landlord.com", action: "rejected", date: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), admin: "Adeyemi Johnson", notes: "Property ownership document expired." },
    { landlordName: "Segun Adeola", email: "segun.adeola@landlord.com", action: "approved", date: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), admin: "Adeyemi Johnson", notes: "Documents verified. Legitimate property owner." }
  ],

  finance: {
    overview: {
      totalRevenue: 8450000,
      thisMonth: 1240000,
      pendingPayouts: 380000,
      openDisputes: 3,
      urgentDisputes: 2
    },
    transactions: [
      { id: "TXN-7382", date: "2025-05-30", tenant: "Amaka Nwosu", landlord: "David Okonkwo", listing: "3 Bed Flat, Lekki", gross: 1200000, fee: 36000, net: 1164000, method: "Paystack", status: "paid" },
      { id: "TXN-7381", date: "2025-05-29", tenant: "Tunde Adebayo", landlord: "Kemi Balogun", listing: "2 Bed Apt, Yaba", gross: 800000, fee: 24000, net: 776000, method: "Bank Transfer", status: "paid" },
      { id: "TXN-7380", date: "2025-05-28", tenant: "Chioma Eze", landlord: "Adeyemi Johnson", listing: "4 Bed Duplex, Ajah", gross: 2000000, fee: 60000, net: 1940000, method: "Paystack", status: "paid" },
      { id: "TXN-7379", date: "2025-05-27", tenant: "Femi Adesanya", landlord: "Ngozi Obi", listing: "3 Bed Terrace, Lekki", gross: 1500000, fee: 45000, net: 1455000, method: "Card Payment", status: "pending" },
      { id: "TXN-7378", date: "2025-05-26", tenant: "Bola Adekunle", landlord: "Sade Martins", listing: "Studio, Surulere", gross: 950000, fee: 28500, net: 921500, method: "Paystack", status: "paid" },
      { id: "TXN-7377", date: "2025-05-25", tenant: "Ngozi Obi", landlord: "David Okonkwo", listing: "5 Bed House, Ikoyi", gross: 4500000, fee: 135000, net: 4365000, method: "Bank Transfer", status: "paid" },
      { id: "TXN-7376", date: "2025-05-24", tenant: "Sade Martins", landlord: "Tunde Adebayo", listing: "1 Bed Apt, Gbagada", gross: 600000, fee: 18000, net: 582000, method: "Paystack", status: "failed" }
    ],
    monthlyRevenue: [
      { month: "Dec", listingFees: 320000, transactionFees: 280000, badgeFees: 120000, referralEarnings: 80000 },
      { month: "Jan", listingFees: 450000, transactionFees: 380000, badgeFees: 150000, referralEarnings: 100000 },
      { month: "Feb", listingFees: 580000, transactionFees: 490000, badgeFees: 180000, referralEarnings: 120000 },
      { month: "Mar", listingFees: 720000, transactionFees: 610000, badgeFees: 210000, referralEarnings: 150000 },
      { month: "Apr", listingFees: 890000, transactionFees: 780000, badgeFees: 240000, referralEarnings: 180000 },
      { month: "May", listingFees: 1050000, transactionFees: 920000, badgeFees: 270000, referralEarnings: 210000 }
    ],
    topLandlords: [
      { name: "David Okonkwo", earnings: 650000, listings: 8 },
      { name: "Kemi Balogun", earnings: 520000, listings: 6 },
      { name: "Adeyemi Johnson", earnings: 410000, listings: 5 },
      { name: "Amaka Nwosu", earnings: 360000, listings: 4 },
      { name: "Tunde Adebayo", earnings: 290000, listings: 3 }
    ],
    disputes: [
      { id: "DSP001", tenant: "Amaka Nwosu", landlord: "David Okonkwo", listing: "3 Bed Flat, Lekki", amount: 1200000, reason: "Property not as described", opened: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), status: "open" },
      { id: "DSP002", tenant: "Femi Adesanya", landlord: "Ngozi Obi", listing: "3 Bed Terrace", amount: 1500000, reason: "Landlord unresponsive", opened: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), status: "under_review" },
      { id: "DSP003", tenant: "Sade Martins", landlord: "Kemi Balogun", listing: "2 Bed Apt", amount: 800000, reason: "Double booking", opened: new Date(Date.now() - 14 * 24 * 3600000).toISOString(), status: "resolved_refunded" }
    ],
    payouts: [
      { landlord: "David Okonkwo", listing: "3 Bed Flat, Lekki", gross: 1200000, fee: 36000, net: 1164000, method: "Bank Transfer", status: "paid", date: "2025-05-30" },
      { landlord: "Kemi Balogun", listing: "2 Bed Apt, Yaba", gross: 800000, fee: 24000, net: 776000, method: "Bank Transfer", status: "paid", date: "2025-05-29" },
      { landlord: "Adeyemi Johnson", listing: "4 Bed Duplex", gross: 2000000, fee: 60000, net: 1940000, method: "Bank Transfer", status: "pending", date: "2025-06-01" },
      { landlord: "Ngozi Obi", listing: "3 Bed Terrace", gross: 1500000, fee: 45000, net: 1455000, method: "Bank Transfer", status: "on_hold", date: "2025-05-28" }
    ],
    badges: [
      { landlord: "David Okonkwo", email: "david.okonkwo@landlord.com", amount: 15000, date: "2025-01-10", expiry: "2026-01-10", status: "active" },
      { landlord: "Kemi Balogun", email: "kemi.balogun@landlord.com", amount: 15000, date: "2025-01-12", expiry: "2026-01-12", status: "active" },
      { landlord: "Babatunde Fashola", email: "b.fashola@landlord.com", amount: 15000, date: "2024-06-01", expiry: "2025-06-01", status: "expired" }
    ],
    referrals: [
      { partner: "Carbon", category: "Rent Financing", count: 45, perReferral: 5000, total: 225000, lastPayment: "2025-05-15", status: "active" },
      { partner: "FairMoney", category: "Rent Financing", count: 38, perReferral: 4500, total: 171000, lastPayment: "2025-05-20", status: "active" },
      { partner: "Smooth Movers Lagos", category: "Moving Services", count: 22, perReferral: 3000, total: 66000, lastPayment: "2025-05-10", status: "active" },
      { partner: "Spectranet", category: "Internet", count: 18, perReferral: 2500, total: 45000, lastPayment: "2025-04-30", status: "active" }
    ],
    listingFees: [
      { landlord: "David Okonkwo", email: "david.okonkwo@landlord.com", tier: "Premium", amount: 50000, paymentDate: "2025-01-10", expiry: "2026-01-10", status: "active" },
      { landlord: "Kemi Balogun", email: "kemi.balogun@landlord.com", tier: "Standard", amount: 25000, paymentDate: "2025-01-12", expiry: "2026-01-12", status: "active" },
      { landlord: "Adeyemi Johnson", email: "adeyemi.johnson@landlord.com", tier: "Standard", amount: 25000, paymentDate: "2025-01-20", expiry: "2026-01-20", status: "active" },
      { landlord: "Amaka Nwosu", email: "amaka.nwosu@landlord.com", tier: "Free", amount: 0, paymentDate: "2025-02-01", expiry: "2025-08-01", status: "expiring" },
      { landlord: "Tunde Adebayo", email: "tunde.adebayo@landlord.com", tier: "Standard", amount: 25000, paymentDate: "2024-06-01", expiry: "2025-06-01", status: "expired" }
    ]
  },

  analytics: {
    weeklySignups: {
      labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
      tenants: [48, 62, 55, 78, 91, 84, 97, 110],
      landlords: [12, 18, 15, 22, 28, 24, 31, 35]
    },
    inquiriesByArea: [
      { area: "Lekki Phase 1", count: 1245 },
      { area: "Yaba", count: 987 },
      { area: "Ajah", count: 764 },
      { area: "Surulere", count: 612 },
      { area: "Gbagada", count: 481 },
      { area: "Soyi", count: 376 }
    ],
    budgetDistribution: [
      { label: "Below ₦500K", value: 18 },
      { label: "₦500K–₦1M", value: 28 },
      { label: "₦1M–₦2M", value: 32 },
      { label: "₦2M–₦3M", value: 14 },
      { label: "Above ₦3M", value: 8 }
    ],
    topListings: [
      { title: "4 Bedroom Terrace Duplex", area: "Lekki Phase 1", inquiries: 214, views: 1890, saves: 145, occupancy: 95, performance: "Excellent" },
      { title: "3 Bedroom Flat", area: "Yaba", inquiries: 187, views: 1420, saves: 98, occupancy: 88, performance: "Excellent" },
      { title: "2 Bedroom Apartment", area: "Ajah", inquiries: 154, views: 1112, saves: 76, occupancy: 85, performance: "Very Good" },
      { title: "Studio Apartment", area: "Surulere", inquiries: 132, views: 982, saves: 67, occupancy: 80, performance: "Very Good" },
      { title: "4 Bedroom Duplex", area: "Gbagada", inquiries: 118, views: 845, saves: 56, occupancy: 76, performance: "Good" }
    ],
    trafficBySource: [
      { source: "Direct", value: 43 },
      { source: "Organic Search", value: 28 },
      { source: "Social Media", value: 15 },
      { source: "Referrals", value: 10 },
      { source: "Other", value: 4 }
    ],
    topKeywords: [
      { keyword: "3 bedroom flat lekki", searches: 842 },
      { keyword: "2 bedroom apartment yaba", searches: 621 },
      { keyword: "4 bedroom duplex ajah", searches: 514 },
      { keyword: "studio apartment surulere", searches: 398 },
      { keyword: "mini flat magodo", searches: 276 }
    ],
    deviceUsage: [
      { device: "Mobile", value: 72 },
      { device: "Desktop", value: 24 },
      { device: "Tablet", value: 4 }
    ],
    userGrowth: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      tenants: [400, 650, 920, 1100, 1320, 1600],
      landlords: [120, 210, 310, 420, 510, 620]
    },
    platformOverview: {
      totalUsers: { value: 1842, trend: "+14 this week" },
      activeListings: { value: 347, trend: "+23 this month" },
      totalInquiries: { value: 4291, trend: "+18% this week" },
      messagesSent: { value: 8745, trend: "+11% this week" },
      profileViews: { value: 12345, trend: "+20% this week" },
      whatsappClicks: { value: 2891, trend: "+22% this week" }
    },
    topLandlordsByListings: [
      { initials: "DO", name: "David Okonkwo", listings: 8, active: 8, inquiries: 456, revenue: 1280000 },
      { initials: "KB", name: "Kemi Balogun", listings: 6, active: 6, inquiries: 342, revenue: 960000 },
      { initials: "AJ", name: "Adeyemi Johnson", listings: 5, active: 5, inquiries: 298, revenue: 840000 },
      { initials: "AN", name: "Amaka Nwosu", listings: 4, active: 4, inquiries: 276, revenue: 720000 },
      { initials: "TA", name: "Tunde Adebayo", listings: 3, active: 3, inquiries: 214, revenue: 600000 }
    ]
  },

  activityLog: [
    { icon: "user-plus", type: "New user registered", details: "Adebayo Femi (Tenant)", user: "Self-registration", time: new Date(Date.now() - 2 * 3600000).toISOString() },
    { icon: "home", type: "New listing submitted", details: "4 Bedroom Duplex in Lekki Phase 1", user: "David Okonkwo", time: new Date(Date.now() - 3 * 3600000).toISOString() },
    { icon: "message-circle", type: "New inquiry received", details: "About 3 Bed Flat in Yaba", user: "Tunde Adebayo", time: new Date(Date.now() - 4 * 3600000).toISOString() },
    { icon: "check-circle", type: "Verification approved", details: "Chidi Eze (Landlord)", user: "Adeyemi Johnson", time: new Date(Date.now() - 5 * 3600000).toISOString() },
    { icon: "alert-triangle", type: "New complaint received", details: "Listing not available", user: "Amaka Nwosu", time: new Date(Date.now() - 6 * 3600000).toISOString() }
  ],

  recentSignups: [
    { initials: "AF", firstName: "Adebayo", lastName: "Femi", email: "femi.adebayo@email.com", role: "Tenant", time: new Date(Date.now() - 2 * 3600000).toISOString() },
    { initials: "CE", firstName: "Chidi", lastName: "Eze", email: "chidi.eze@email.com", role: "Landlord", time: new Date(Date.now() - 5 * 3600000).toISOString() },
    { initials: "NO", firstName: "Ngozi", lastName: "Obi", email: "ngozi.obi@email.com", role: "Tenant", time: new Date(Date.now() - 8 * 3600000).toISOString() },
    { initials: "FO", firstName: "Fola", lastName: "Oladipo", email: "fola.oladipo@email.com", role: "Landlord", time: new Date(Date.now() - 24 * 3600000).toISOString() },
    { initials: "SM", firstName: "Sade", lastName: "Martins", email: "sade.martins@email.com", role: "Tenant", time: new Date(Date.now() - 24 * 3600000).toISOString() }
  ]
};
