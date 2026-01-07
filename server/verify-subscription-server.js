// Simple Express server to verify Google Play subscriptions using a Service Account
// Usage:
// 1) npm install express google-auth-library node-fetch dotenv
// 2) Create .env with SERVICE_ACCOUNT_FILE=path/to/service-account.json and PACKAGE_NAME=com.example.azkare
// 3) node verify-subscription-server.js

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5555;
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE; // path to JSON key file
const PACKAGE_NAME = process.env.PACKAGE_NAME; // e.g. com.example.azkare

if (!SERVICE_ACCOUNT_FILE) {
  console.warn('SERVICE_ACCOUNT_FILE not set. Set it in .env or environment.');
}
if (!PACKAGE_NAME) {
  console.warn('PACKAGE_NAME not set. Set it in .env or environment.');
}

// Helper: get access token using google-auth-library
async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse && tokenResponse.token ? tokenResponse.token : tokenResponse;
  return token;
}

// POST /verify-subscription
// body: { subscriptionId: 'monthly_subscription', purchaseToken: 'token-from-client', packageName?: 'com.example...' }
app.post('/verify-subscription', async (req, res) => {
  try {
    const { subscriptionId, purchaseToken } = req.body;
    const packageName = req.body.packageName || PACKAGE_NAME;

    if (!subscriptionId || !purchaseToken || !packageName) {
      return res.status(400).json({ error: 'Missing subscriptionId, purchaseToken, or packageName' });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to obtain access token from service account' });
    }

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(subscriptionId)}/tokens/${encodeURIComponent(purchaseToken)}`;

    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data });
    }

    // data contains purchaseState, expiryTimeMillis, etc.
    return res.json({ ok: true, data });
  } catch (err) {
    console.error('verify error', err);
    res.status(500).json({ error: err.message || err });
  }
});

app.listen(PORT, () => console.log(`Verify server listening on http://localhost:${PORT}`));
