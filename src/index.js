require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Cloudflare proxy for accurate IP rate limiting
app.set('trust proxy', 1);

// Body size limit — reject oversized requests before they hit any handler
app.use(express.json({ limit: '50kb' }));

// Global rate limit: 60 requests/min/IP across all routes
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
}));

// Health check
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// API routes
app.use('/goals', require('./api/goals'));
app.use('/webhooks', require('./api/webhooks'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Platform running on port ${PORT}`);
});
