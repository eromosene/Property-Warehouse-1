const router = require('express').Router();
const ctrl = require('../controllers/listings.controller');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(ctrl.list));
router.get('/:id', optionalAuth, asyncHandler(ctrl.getById));
router.get('/:id/similar', asyncHandler(ctrl.similar));
router.post('/:id/view', asyncHandler(ctrl.incrementView));

router.post('/', requireAuth, requireRole('landlord'), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, requireRole('landlord'), asyncHandler(ctrl.updateOwn));
router.delete('/:id', requireAuth, requireRole('landlord'), asyncHandler(ctrl.deleteOwn));

module.exports = router;
