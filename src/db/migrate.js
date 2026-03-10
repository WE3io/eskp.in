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

  `
  CREATE TABLE IF NOT EXISTS helper_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    expertise_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_note TEXT,
    helper_id UUID REFERENCES helpers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
  )`,

  `CREATE INDEX IF NOT EXISTS idx_helper_applications_status ON helper_applications(status)`,
  `CREATE INDEX IF NOT EXISTS idx_helper_applications_email ON helper_applications(email)`,

  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`,
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS idx_matches_stripe_session ON matches(stripe_session_id)`,

  // TSK-049: sensitive-domain review flag
  `ALTER TABLE goals ADD COLUMN IF NOT EXISTS sensitive_domain TEXT`,

  // TSK-021/022: account tokens for export and deletion confirmation
  `
  CREATE TABLE IF NOT EXISTS account_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('export', 'delete_confirm')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_account_tokens_token ON account_tokens(token)`,
  `CREATE INDEX IF NOT EXISTS idx_account_tokens_user_type ON account_tokens(user_id, type)`,

  // TSK-021: anonymised deletion audit log (no PII)
  `
  CREATE TABLE IF NOT EXISTS deletion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tables_affected TEXT[] NOT NULL,
    rows_deleted INT NOT NULL
  )`,

  // TSK-034: add pending_clarification to goals status enum
  `ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_status_check`,
  `ALTER TABLE goals ADD CONSTRAINT goals_status_check
     CHECK (status IN ('submitted','decomposing','matched','introduced','resolved','closed','pending_clarification'))`,

  // TSK-051: email suppression columns for bounce/complaint tracking
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_suppressed_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_suppression_reason TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_users_email_suppressed ON users(email) WHERE email_suppressed_at IS NOT NULL`,

  // TSK-054: raw_text retention — make column nullable so we can null it after decomposition
  // (UK GDPR Art.5(1)(e) storage limitation — raw text is not needed once decomposed)
  `ALTER TABLE goals ALTER COLUMN raw_text DROP NOT NULL`,

  // TSK-054: back-fill — null raw_text for goals that already have a decomposed value
  // (goals in submitted/decomposing status retain raw_text as it may still be needed)
  `UPDATE goals SET raw_text = NULL WHERE decomposed IS NOT NULL AND raw_text IS NOT NULL
   AND status NOT IN ('submitted', 'decomposing', 'pending_clarification')`,

  // TSK-068/063: follow-up tracking — one follow-up email per goal (post-intro check-in or no-match timeout)
  `ALTER TABLE goals ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ`,

  // TSK-094: match quality feedback — 1-click rating from follow-up email
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS feedback_token UUID DEFAULT gen_random_uuid()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_feedback_token ON matches(feedback_token)`,
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS user_rating SMALLINT CHECK (user_rating BETWEEN 1 AND 5)`,
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS user_rated_at TIMESTAMPTZ`,
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
