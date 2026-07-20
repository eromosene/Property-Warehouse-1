// Supabase Storage for uploaded listing images/documents. Replaces create-listing.js's
// client-side canvas-compress-to-base64-in-localStorage approach (Phase 1), then local-disk
// multer storage (Stage 1 backend). The /api/uploads/* route contract (multipart upload in,
// { urls: [...] } out) is unchanged by this swap — only what's inside src/utils/storage.js.
//
// Images go to SUPABASE_IMAGES_BUCKET (public) — the returned value is a real, permanent public
// URL, since listing photos get rendered as <img src> on listings.html/listing-detail.html.
//
// Documents go to SUPABASE_DOCUMENTS_BUCKET (private) — ownership documents are
// verification-only and, per serialize.js, never returned in any API response or rendered
// anywhere in the app today. So instead of a URL, the returned/stored value is the bare storage
// object PATH (e.g. "1737000000000-ab12cd34.pdf"). Nothing currently treats it as a fetchable
// URL; if a "view this document" admin feature is added later, generate a short-lived signed
// URL from that path on demand (supabase.storage.from(bucket).createSignedUrl(path, expirySeconds))
// rather than storing a signed URL — a signed URL embedded in the DB permanently would either
// expire (broken link) or, if given a long expiry, sit around as a long-lived bearer credential.
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

for (const name of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[name]) {
    throw new Error(`${name} is missing. Set it in your .env file — see .env.example.`);
  }
}

const IMAGES_BUCKET = process.env.SUPABASE_IMAGES_BUCKET || 'listings';
const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || 'listing-documents';

// service_role key bypasses Row Level Security — this client must only ever be used
// server-side (it is; nothing here is exposed to the frontend).
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MAX_BYTES = Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024;

function makeStorage() {
  // Buffer in memory instead of writing to local disk — the buffer is uploaded straight to
  // Supabase Storage in the controller, nothing touches this server's filesystem.
  return multer.memoryStorage();
}

function randomObjectKey(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOCUMENT_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const uploadImages = multer({
  storage: makeStorage(),
  limits: { fileSize: MAX_BYTES, files: 6 },
  fileFilter: (req, file, cb) => cb(null, IMAGE_TYPES.has(file.mimetype)),
});

const uploadDocuments = multer({
  storage: makeStorage(),
  limits: { fileSize: MAX_BYTES, files: 5 },
  fileFilter: (req, file, cb) => cb(null, DOCUMENT_TYPES.has(file.mimetype)),
});

// Uploads one already-validated multer file (from req.files, memory storage) to the given
// Supabase bucket and returns the storage object path.
async function uploadFileToBucket(bucket, file) {
  const key = randomObjectKey(file.originalname);
  const { error } = await supabase.storage.from(bucket).upload(key, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new Error(`Supabase Storage upload failed (${bucket}/${key}): ${error.message}`);
  return key;
}

// Images: public bucket, so the durable value is the public URL.
async function uploadImageFile(file) {
  const key = await uploadFileToBucket(IMAGES_BUCKET, file);
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(key).data.publicUrl;
}

// Documents: private bucket, so the durable value is the object path (see file header comment).
async function uploadDocumentFile(file) {
  return uploadFileToBucket(DOCUMENTS_BUCKET, file);
}

module.exports = { uploadImages, uploadDocuments, uploadImageFile, uploadDocumentFile };
