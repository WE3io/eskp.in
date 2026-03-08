require('dotenv').config();
const express = require('express');
const { testConnection } = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Platform running on port ${PORT}`);
});
