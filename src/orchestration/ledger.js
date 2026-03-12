const { pool } = require('../db/connection');

/**
 * Log inference usage to the token_usage table.
 * Fire-and-forget — errors are logged but do not propagate.
 */
function logUsage(response, role, goalId) {
  pool.query(
    `INSERT INTO token_usage (model, input_tokens, output_tokens, operation, goal_id, provider, cost_usd)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      response.actual_model || response.model_id,
      response.usage.input_tokens,
      response.usage.output_tokens,
      role,
      goalId || null,
      response.provider,
      response.cost_usd || 0,
    ]
  ).catch(err => console.error('ledger: token_usage log error:', err.message));
}

/**
 * Query total spend for the current month, optionally filtered by role.
 */
async function getMonthlySpend(role) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const params = [startOfMonth.toISOString()];
  let whereClause = 'WHERE created_at >= $1';

  if (role) {
    whereClause += ' AND operation = $2';
    params.push(role);
  }

  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(cost_usd), 0) AS total_cost,
      COALESCE(SUM(input_tokens), 0)::int AS total_input,
      COALESCE(SUM(output_tokens), 0)::int AS total_output,
      COUNT(*)::int AS total_calls
    FROM token_usage
    ${whereClause}
  `, params);

  return {
    cost_usd: parseFloat(rows[0].total_cost) || 0,
    input_tokens: rows[0].total_input,
    output_tokens: rows[0].total_output,
    calls: rows[0].total_calls,
  };
}

module.exports = { logUsage, getMonthlySpend };
