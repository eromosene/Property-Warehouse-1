const { uploadImageFile, uploadDocumentFile, deleteImageFile, deleteDocumentFile } = require('../utils/storage');

// Storage keys are namespaced "<landlordId>-..." (see storage.js), so confirming a landlord
// owns a file to delete it is a cheap prefix check — no DB lookup needed, since in-progress
// (not-yet-published) uploads aren't persisted anywhere else.
const SAFE_FILENAME = /^[\w.-]+$/;
function assertOwnedFilename(filename, userId) {
  if (!SAFE_FILENAME.test(filename) || !filename.startsWith(`${userId}-`)) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
}

// POST /api/uploads/images — landlord-only, multipart field name "images" (up to 6).
// Uploads each file to the public Supabase "images" bucket; returns each file's storage key
// (needed to delete it later) and public URL (needed to render/publish it).
async function uploadImages(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No image files received' });
  const uploaded = await Promise.all(files.map(f => uploadImageFile(f, req.user.id)));
  res.status(201).json({ files: uploaded });
}

// POST /api/uploads/documents — landlord-only, multipart field name "documents" (up to 5).
// Uploads each file to the private Supabase documents bucket. Only a storage key is returned —
// see storage.js header comment for why documents have no public URL.
async function uploadDocuments(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No document files received' });
  const uploaded = await Promise.all(files.map(f => uploadDocumentFile(f, req.user.id)));
  res.status(201).json({ files: uploaded });
}

// DELETE /api/uploads/images/:filename — removes a photo the landlord uploaded but hasn't
// published yet (e.g. they removed it from the wizard before hitting Publish).
async function deleteImage(req, res) {
  assertOwnedFilename(req.params.filename, req.user.id);
  await deleteImageFile(req.params.filename);
  res.status(204).end();
}

// DELETE /api/uploads/documents/:filename — same, for ownership documents.
async function deleteDocument(req, res) {
  assertOwnedFilename(req.params.filename, req.user.id);
  await deleteDocumentFile(req.params.filename);
  res.status(204).end();
}

module.exports = { uploadImages, uploadDocuments, deleteImage, deleteDocument };
