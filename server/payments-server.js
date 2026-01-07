// Example Node/Express server to create Stripe Checkout session
// Usage:
// 1) npm install express stripe dotenv
// 2) create a .env with STRIPE_SECRET=sk_test_xxx and DOMAIN=http://localhost:8080
// 3) node payments-server.js

const express = require('express');
const Stripe = require('stripe');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4242;

if (!process.env.STRIPE_SECRET) {
  console.warn('Warning: STRIPE_SECRET not set. Set STRIPE_SECRET in .env before using this server.');
}

const stripe = Stripe(process.env.STRIPE_SECRET || 'sk_test_your_secret');

app.use(express.json());

// Create a Stripe Checkout Session and return the session url
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'تبرع / ترقية التطبيق' },
          unit_amount: 1000 // 10.00 USD
        },
        quantity: 1
      }],
      success_url: (process.env.DOMAIN || 'http://localhost:8080') + '/?payment=success',
      cancel_url: (process.env.DOMAIN || 'http://localhost:8080') + '/?payment=cancel'
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static root (optional)
app.use(express.static(path.join(__dirname, '..')));

app.listen(port, () => console.log(`Payments server listening on http://localhost:${port}`));
