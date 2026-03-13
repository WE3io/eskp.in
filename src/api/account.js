/**
 * TSK-021 / TSK-022: Account deletion and data export API routes.
 *
 * GET /account/export?token=xxx       — download all user data as JSON
 * GET /account/delete/confirm?token=xxx — confirm account deletion
 */

const express = require('express');
const router = express.Router();
const logger = require('../logger');
const { getExportData, confirmDeletion } = require('../services/account');

// GET /account/export?token=xxx
// Returns all user data as a JSON download. Token is single-use, 48h expiry.
router.get('/export', async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ error: 'Invalid or missing token' });
  }

  try {
    const data = await getExportData(token);
    if (!data) {
      return res.status(410).json({ error: 'Token invalid, expired, or already used' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="eskp-data-export.json"');
    res.json(data);
  } catch (err) {
    logger.error({ err }, '/account/export error');
    res.status(500).json({ error: 'internal error' });
  }
});

// GET /account/delete/confirm?token=xxx
// Confirms and executes account deletion. Shows a simple HTML confirmation page.
router.get('/delete/confirm', async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).send(deletionPage('Invalid request', 'The deletion link is invalid. Please check the email and try again.', false));
  }

  try {
    const result = await confirmDeletion(token);
    if (!result) {
      return res.status(410).send(deletionPage('Link expired', 'This deletion link has expired or has already been used. If you still want to delete your account, please email delete@mail.eskp.in.', false));
    }
    res.send(deletionPage('Account deleted', 'Your account and all associated data have been permanently deleted. A confirmation has been sent to your email.', true));
  } catch (err) {
    logger.error({ err }, '/account/delete/confirm error');
    res.status(500).send(deletionPage('Error', `Something went wrong. Please contact ${process.env.PANEL_EMAIL || 'panel@eskp.in'}.`, false));
  }
});

function deletionPage(title, message, success) {
  const colour = success ? '#2E7D32' : '#8B1A1A';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — eskp.in</title>
  <style>
    body { font-family: Georgia, serif; background: #FAF7F4; color: #2C2825; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 8px; padding: 40px; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    h1 { color: ${colour}; font-size: 24px; margin-bottom: 16px; }
    p { color: #5A5450; line-height: 1.6; }
    a { color: #C4622D; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p><a href="/">Return to eskp.in</a></p>
  </div>
</body>
</html>`;
}

module.exports = router;
