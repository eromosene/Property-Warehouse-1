const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

router.get('/listings', ctrl.list);
router.patch('/listings/:id/approve', ctrl.approve);
router.patch('/listings/:id/reject', ctrl.reject);
router.post('/listings/bulk-approve', ctrl.bulkApprove);
router.patch('/listings/:id', ctrl.update);
router.delete('/listings/:id', ctrl.remove);

module.exports = router;
