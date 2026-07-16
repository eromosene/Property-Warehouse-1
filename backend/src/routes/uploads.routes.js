const router = require('express').Router();
const { uploadImages: imageUpload, uploadDocuments: documentUpload } = require('../utils/storage');
const ctrl = require('../controllers/uploads.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('landlord'));

router.post('/images', imageUpload.array('images', 6), ctrl.uploadImages);
router.post('/documents', documentUpload.array('documents', 5), ctrl.uploadDocuments);

module.exports = router;
