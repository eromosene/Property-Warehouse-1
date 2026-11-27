// Minimal in-memory rate limiter for public write endpoints (feedback, enquiries), so one
// client can't flood the tables. Per-process only — fine for a single Render instance.
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    // Requests arrive via the frontend's /api proxy, so req.ip can be the proxy's address for
    // everyone; key on the original client from X-Forwarded-For when present. Spoofable, but
    // this is only a flood guard, not access control.
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const key = forwarded || req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10000) {
      for (const [k, times] of hits) if (!times.some((t) => now - t < windowMs)) hits.delete(k);
    }
    next();
  };
}

module.exports = rateLimit;
