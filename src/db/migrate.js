require('dotenv').config();
const { pool } = require('./connection');

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
  )`,

  `
  CREATE TABLE IF NOT EXISTS helpers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    expertise TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `
  CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    raw_text TEXT NOT NULL,
    decomposed JSONB,
    status TEXT NOT NULL DEFAULT 'submitted'
      CHECK (status IN ('submitted','decomposing','matched','introduced','resolved','closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `
  CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id),
    helper_id UUID NOT NULL REFERENCES helpers(id),
    reasoning TEXT,
    status TEXT NOT NULL DEFAULT 'proposed'
      CHECK (status IN ('proposed','introduced','accepted','declined','completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `
  CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    resend_id TEXT,
    goal_id UUID REFERENCES goals(id),
    match_id UUID REFERENCES matches(id),
    raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `
  CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    goal_id UUID REFERENCES goals(id),
    source TEXT NOT NULL DEFAULT 'email'
      CHECK (source IN ('email','web','manual')),
    content TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)`,
  `CREATE INDEX IF NOT EXISTS idx_matches_goal_id ON matches(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_emails_goal_id ON emails(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_processed ON feedback(processed)`,
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const sql of migrations) {
      await client.query(sql);
    }
    await client.query('COMMIT');
    console.log(`Migrations complete — ${migrations.length} statements applied.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(e => { console.error(e); process.exit(1); });
