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

router.get('/users', asyncHandler(ctrl.listUsers));
router.patch('/users/:id/verify', asyncHandler(ctrl.setUserVerified));
router.get('/inquiries', asyncHandler(ctrl.listInquiries));
router.get('/feedback', asyncHandler(ctrl.listFeedback));
router.patch('/feedback/:id', asyncHandler(ctrl.setFeedbackStatus));

module.exports = router;
