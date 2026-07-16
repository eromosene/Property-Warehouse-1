const router = require('express').Router();
const ctrl = require('../controllers/listings.controller');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', optionalAuth, ctrl.getById);
router.get('/:id/similar', ctrl.similar);
router.post('/:id/view', ctrl.incrementView);

router.post('/', requireAuth, requireRole('landlord'), ctrl.create);
router.patch('/:id', requireAuth, requireRole('landlord'), ctrl.updateOwn);
router.delete('/:id', requireAuth, requireRole('landlord'), ctrl.deleteOwn);

module.exports = router;
