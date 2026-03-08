const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testConnection() {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
}

module.exports = { pool, testConnection };
