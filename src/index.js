require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./db/connection');
const { constructEvent } = require('./services/payments');
const { sendHelperIntroById } = require('./services/platform');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Cloudflare proxy for accurate IP rate limiting
app.set('trust proxy', 1);

// Stripe webhook — registered BEFORE express.json() so req.body is raw Buffer
// express.raw() is applied inline as route middleware; express.json() never sees this request
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = constructEvent(req.body, sig);
  } catch (err) {
    console.error('Stripe signature failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const { goal_id, match_id } = event.data.object.metadata || {};
    if (goal_id && match_id) {
      try {
        await sendHelperIntroById(goal_id, match_id);
      } catch (err) {
        console.error('sendHelperIntroById failed:', err);
        return res.status(500).json({ error: 'internal error' });
      }
    }
  }

  res.json({ received: true });
});

// Body size limit for all other routes
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
app.use('/account', require('./api/account'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Platform running on port ${PORT}`);
});
