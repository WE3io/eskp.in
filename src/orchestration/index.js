const logger = require('../logger');
const { getConfig, resetConfig } = require('./config');
const { resolveRole, listModels, getModel } = require('./registry');
const { dispatch } = require('./dispatch');
const { logUsage } = require('./ledger');
const { checkBudget, BudgetExceededError } = require('./budget');
const { checkHealth: checkOllamaHealth } = require('./adapters/ollama');

/**
 * Main inference entry point.
 *
 * @param {object} opts
 * @param {string} opts.role - Role name (e.g. 'decomposer', 'matcher', 'classifier')
 * @param {Array}  opts.messages - Chat messages [{ role, content }]
 * @param {string} [opts.system] - System prompt
 * @param {string} [opts.goalId] - Goal ID for tracking
 * @param {Array}  [opts.tools] - Tool definitions (passed through to adapter)
 * @param {object} [opts.tool_choice] - Tool choice config (passed through to adapter)
 * @param {object} [opts.metadata] - Additional metadata
 * @returns {Promise<object>} Unified response
 */
async function infer({ role, messages, system, goalId, tools, tool_choice, metadata }) {
  // 1. Resolve role → model + fallback + overrides
  const resolved = resolveRole(role);

  // 2. Check budget gate
  const budget = await checkBudget(role, resolved.budget);
  if (!budget.ok) {
    // Budget exhausted — try local fallback if configured
    if (resolved.budgetFallback) {
      logger.warn({ role, fallback: resolved.budgetFallback.id }, 'infer: budget exhausted, attempting local fallback');
      try {
        const localHealth = await checkOllamaHealth(resolved.budgetFallback.endpoint);
        if (!localHealth.healthy) {
          throw new Error('Ollama is not running or not healthy');
        }
        if (!localHealth.models.some(m => m.includes(resolved.budgetFallback.model_name))) {
          throw new Error(`Model ${resolved.budgetFallback.model_name} not available in Ollama`);
        }

        const extra = {};
        if (tools) extra.tools = tools;
        if (tool_choice) extra.tool_choice = tool_choice;

        const localResolved = {
          model: resolved.budgetFallback,
          fallback: null,
          overrides: resolved.overrides,
        };
        const response = await dispatch(localResolved, messages, system, extra);

        logUsage(response, role, goalId);
        logger.info({ role, fallback: resolved.budgetFallback.id }, 'infer: served by local fallback (budget exhausted)');
        return response;
      } catch (localErr) {
        logger.warn({ role, err: localErr }, 'infer: local fallback failed');
        // Fall through to throw BudgetExceededError
      }
    }

    throw new BudgetExceededError(
      `Budget exceeded for ${budget.scope}: $${budget.spent.toFixed(4)} / $${budget.cap.toFixed(2)}`,
      budget
    );
  }
  if (budget.action === 'warn') {
    logger.warn({ role, scope: budget.scope, spent: budget.spent, cap: budget.cap }, 'infer: budget warning');
  }

  // 3. Dispatch to model (with fallback on failure)
  const extra = {};
  if (tools) extra.tools = tools;
  if (tool_choice) extra.tool_choice = tool_choice;
  const response = await dispatch(resolved, messages, system, extra);

  // 4. Log usage
  logUsage(response, role, goalId);

  return response;
}

/**
 * Check health of all configured models.
 */
async function checkHealth() {
  const models = listModels();
  const results = {};

  for (const model of models) {
    if (model.type === 'local') {
      const health = await checkOllamaHealth(model.endpoint);
      results[model.id] = {
        healthy: health.healthy && health.models.some(m => m.includes(model.model_name)),
        ...health,
      };
    } else if (model.type === 'openrouter') {
      results[model.id] = { healthy: !!process.env.OPENROUTER_API_KEY, type: 'openrouter' };
    } else if (model.type === 'anthropic') {
      results[model.id] = { healthy: !!process.env.ANTHROPIC_API_KEY, type: 'anthropic' };
    }
  }

  return results;
}

module.exports = {
  infer,
  checkHealth,
  getConfig,
  resetConfig,
  listModels,
  getModel,
  BudgetExceededError,
};
