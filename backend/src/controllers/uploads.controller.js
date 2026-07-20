const { uploadImageFile, uploadDocumentFile } = require('../utils/storage');

// POST /api/uploads/images — landlord-only, multipart field name "images" (up to 6).
// Uploads each file to the public Supabase "images" bucket and returns their public URLs.
async function uploadImages(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No image files received' });
  const urls = await Promise.all(files.map(uploadImageFile));
  res.status(201).json({ urls });
}

// POST /api/uploads/documents — landlord-only, multipart field name "documents" (up to 5).
// Uploads each file to the private Supabase documents bucket. The returned "urls" are actually
// bare storage object paths, not fetchable URLs — see storage.js header comment for why.
async function uploadDocuments(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No document files received' });
  const urls = await Promise.all(files.map(uploadDocumentFile));
  res.status(201).json({ urls });
}

module.exports = { uploadImages, uploadDocuments };
