const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/signup', asyncHandler(ctrl.signup));
router.post('/login', asyncHandler(ctrl.login));
router.post('/admin/login', asyncHandler(ctrl.adminLogin));
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
