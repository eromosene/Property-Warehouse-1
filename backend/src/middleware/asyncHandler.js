// Express 4 does not catch rejected promises thrown by async route handlers — an unhandled
// rejection there just hangs the request with no response. Wrap every controller that awaits a
// (now-async) Postgres call with this so thrown/rejected errors reach app.js's error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
