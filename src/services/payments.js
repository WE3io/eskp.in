/**
 * Stripe payment integration.
 * One-time checkout session per introduction.
 */
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Price in minor units (pence). £10 = 1000. Configurable via env.
const INTRO_PRICE_PENCE = parseInt(process.env.STRIPE_INTRO_PRICE_PENCE || '1000', 10);
const BASE_URL = process.env.BASE_URL || 'https://eskp.in';

/**
 * Create a Stripe Checkout session for an introduction.
 * Returns the session URL to embed in the acknowledgement email.
 */
async function createIntroCheckout({ goalId, matchId, userEmail, summary }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [{
      price_data: {
        currency: 'gbp',
        unit_amount: INTRO_PRICE_PENCE,
        product_data: {
          name: 'eskp.in introduction',
          description: summary.slice(0, 127),
        },
      },
      quantity: 1,
    }],
    metadata: {
      goal_id: goalId,
      match_id: matchId,
    },
    success_url: `${BASE_URL}/payment-success.html`,
    cancel_url: `${BASE_URL}/payment-cancel.html`,
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Verify and parse a Stripe webhook event.
 * rawBody must be the raw Buffer (not parsed JSON).
 */
function constructEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

module.exports = { createIntroCheckout, constructEvent };
