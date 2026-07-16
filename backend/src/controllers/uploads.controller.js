const { toPublicUrl } = require('../utils/storage');

// POST /api/uploads/images — landlord-only, multipart field name "images" (up to 6).
// Replaces create-listing.js step 3's base64-data-URL embedding; frontend should upload here
// first and pass the returned urls[] into POST /api/listings as `images`.
function uploadImages(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No image files received' });
  const urls = files.map((f) => toPublicUrl(req, 'images', f.filename));
  res.status(201).json({ urls });
}

// POST /api/uploads/documents — landlord-only, multipart field name "documents" (up to 5).
// Replaces create-listing.js step 5's base64 FileReader embedding for ownership documents.
function uploadDocuments(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No document files received' });
  const urls = files.map((f) => toPublicUrl(req, 'documents', f.filename));
  res.status(201).json({ urls });
}

module.exports = { uploadImages, uploadDocuments };
