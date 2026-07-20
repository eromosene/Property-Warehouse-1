const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(requireAuth, requireRole('admin'));

router.get('/listings', asyncHandler(ctrl.list));
router.patch('/listings/:id/approve', asyncHandler(ctrl.approve));
router.patch('/listings/:id/reject', asyncHandler(ctrl.reject));
router.post('/listings/bulk-approve', asyncHandler(ctrl.bulkApprove));
router.patch('/listings/:id', asyncHandler(ctrl.update));
router.delete('/listings/:id', asyncHandler(ctrl.remove));

module.exports = router;
