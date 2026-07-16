// Local-disk multer storage for Phase 1 (dev). Replaces create-listing.js's client-side
// canvas-compress-to-base64-in-localStorage approach, which hits the browser's ~5-10MB
// localStorage quota fast (see BACKEND-REQUIREMENTS.md §4). Swap this file for an S3/R2
// pre-signed-upload flow in a later phase — the /api/uploads/* route contracts (multipart
// upload in, { urls: [...] } out) don't need to change for that swap.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.isAbsolute(process.env.UPLOAD_DIR || '')
  ? process.env.UPLOAD_DIR
  : path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || './uploads');

const IMAGE_DIR = path.join(UPLOAD_ROOT, 'images');
const DOCUMENT_DIR = path.join(UPLOAD_ROOT, 'documents');
fs.mkdirSync(IMAGE_DIR, { recursive: true });
fs.mkdirSync(DOCUMENT_DIR, { recursive: true });

const MAX_BYTES = Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024;

function makeStorage(dir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    },
  });
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOCUMENT_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const uploadImages = multer({
  storage: makeStorage(IMAGE_DIR),
  limits: { fileSize: MAX_BYTES, files: 6 },
  fileFilter: (req, file, cb) => cb(null, IMAGE_TYPES.has(file.mimetype)),
});

const uploadDocuments = multer({
  storage: makeStorage(DOCUMENT_DIR),
  limits: { fileSize: MAX_BYTES, files: 5 },
  fileFilter: (req, file, cb) => cb(null, DOCUMENT_TYPES.has(file.mimetype)),
});

// Returns an ABSOLUTE URL, not a root-relative path. The uploaded file is served from this
// backend's origin (e.g. http://localhost:4000), but the URL gets stored on a listing and
// rendered as <img src> on pages served from a different origin (the static frontend on
// :5000) — a root-relative "/uploads/..." path would resolve against the FRONTEND's origin in
// that context and 404. Uses the incoming request's own host, so this stays correct without a
// separately-configured "public URL" setting that could drift out of sync; if this backend is
// ever put behind a reverse proxy, Express's `trust proxy` setting needs to be configured so
// req.protocol/req.get('host') reflect the real public-facing host instead of the proxy's.
function toPublicUrl(req, kind, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${kind}/${filename}`;
}

module.exports = { uploadImages, uploadDocuments, toPublicUrl };
