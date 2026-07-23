const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const listingsRoutes = require('./routes/listings.routes');
const landlordRoutes = require('./routes/landlord.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadsRoutes = require('./routes/uploads.routes');
const favouritesRoutes = require('./routes/favourites.routes');

const app = express();

// Render terminates TLS at its edge proxy and forwards requests over plain HTTP internally.
// Trusting the first proxy hop lets Express read X-Forwarded-* correctly (req.secure,
// req.protocol, req.ip) instead of seeing every request as insecure.
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'https://property-warehouse-frontend.onrender.com',
  'http://localhost:5000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/favourites', favouritesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
