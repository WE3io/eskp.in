const { getConfig } = require('./config');

function getModel(name, config) {
  const cfg = config || getConfig();
  const model = cfg.models[name];
  if (!model) {
    throw new Error(`Model "${name}" not found in registry`);
  }
  return { id: name, ...model };
}

function listModels(config) {
  const cfg = config || getConfig();
  return Object.entries(cfg.models).map(([id, model]) => ({ id, ...model }));
}

function getModelsByType(type, config) {
  return listModels(config).filter(m => m.type === type);
}

function resolveRole(role, config) {
  const cfg = config || getConfig();
  const roleConfig = cfg.roles[role];
  if (!roleConfig) {
    throw new Error(`Role "${role}" not found in configuration`);
  }

  const model = getModel(roleConfig.default, cfg);
  const fallback = roleConfig.fallback ? getModel(roleConfig.fallback, cfg) : null;
  const budgetFallback = roleConfig.budget_fallback ? getModel(roleConfig.budget_fallback, cfg) : null;

  const overrides = {};
  if (roleConfig.max_tokens !== undefined) overrides.max_tokens = roleConfig.max_tokens;
  if (roleConfig.temperature !== undefined) overrides.temperature = roleConfig.temperature;

  return {
    model,
    fallback,
    budgetFallback,
    overrides,
    budget: roleConfig.budget || null,
    role,
  };
}

module.exports = { getModel, listModels, getModelsByType, resolveRole };
