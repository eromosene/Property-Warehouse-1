const router = require('express').Router();
const ctrl = require('../controllers/favourites.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(requireAuth, requireRole('tenant'));

router.get('/', asyncHandler(ctrl.list));
router.post('/:listingId', asyncHandler(ctrl.save));
router.delete('/:listingId', asyncHandler(ctrl.remove));

module.exports = router;
