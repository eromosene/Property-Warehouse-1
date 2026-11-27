const router = require('express').Router();
const ctrl = require('../controllers/activity.controller');
const { optionalAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const rateLimit = require('../middleware/rateLimit');

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });

// Mounted at /api: POST /api/inquiries, POST /api/feedback
router.post('/inquiries', limiter, optionalAuth, asyncHandler(ctrl.createInquiry));
router.post('/feedback', limiter, optionalAuth, asyncHandler(ctrl.createFeedback));

module.exports = router;
