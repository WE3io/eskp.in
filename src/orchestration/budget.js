const { getMonthlySpend } = require('./ledger');

const MONTHLY_BUDGET = parseFloat(process.env.MONTHLY_TOKEN_BUDGET || 30);
const WARN_THRESHOLD = 0.70;

class BudgetExceededError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'BudgetExceededError';
    this.details = details;
  }
}

/**
 * Check budget gates before dispatching a call.
 * Returns { ok, action, spent, cap, remaining }.
 */
async function checkBudget(role, roleBudget) {
  const results = [];

  // Global monthly cap
  const globalSpend = await getMonthlySpend();
  const globalResult = evaluateGate('monthly', globalSpend.cost_usd, MONTHLY_BUDGET);
  results.push(globalResult);

  // Per-role monthly cap (if configured)
  if (roleBudget && roleBudget.monthly_usd) {
    const roleSpend = await getMonthlySpend(role);
    const roleResult = evaluateGate(`role:${role}`, roleSpend.cost_usd, roleBudget.monthly_usd);
    results.push(roleResult);
  }

  // Return the most restrictive result
  const blocked = results.find(r => r.action === 'block');
  if (blocked) return blocked;

  const warned = results.find(r => r.action === 'warn');
  if (warned) return warned;

  return results[0] || { ok: true, action: 'allow', spent: 0, cap: MONTHLY_BUDGET, remaining: MONTHLY_BUDGET };
}

function evaluateGate(scope, spent, cap) {
  const remaining = cap - spent;
  const pctUsed = cap > 0 ? spent / cap : 0;

  if (spent >= cap) {
    return { ok: false, action: 'block', scope, spent, cap, remaining: 0 };
  }

  if (pctUsed >= WARN_THRESHOLD) {
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth < 21) {
      console.warn(`budget: ${scope} at ${(pctUsed * 100).toFixed(1)}% before day 21`);
    }
    return { ok: true, action: 'warn', scope, spent, cap, remaining };
  }

  return { ok: true, action: 'allow', scope, spent, cap, remaining };
}

module.exports = { checkBudget, BudgetExceededError };
