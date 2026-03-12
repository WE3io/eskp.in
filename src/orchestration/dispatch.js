const openrouterAdapter = require('./adapters/openrouter');
const anthropicAdapter = require('./adapters/anthropic');
const ollamaAdapter = require('./adapters/ollama');
const { normaliseOpenRouter, normaliseAnthropic, normaliseOllama, computeCost } = require('./response');

const adapters = {
  openrouter: openrouterAdapter,
  anthropic: anthropicAdapter,
  local: ollamaAdapter,
};

async function dispatchToModel(model, messages, system, overrides, extra) {
  const adapter = adapters[model.type];
  if (!adapter) {
    throw new Error(`No adapter for model type "${model.type}"`);
  }

  const startTime = Date.now();
  const raw = await adapter.dispatch(model, messages, system, overrides, extra || {});

  // Normalise based on provider type
  let response;
  switch (model.type) {
    case 'openrouter':
      response = normaliseOpenRouter(raw, model.id, startTime);
      break;
    case 'anthropic':
      response = normaliseAnthropic(raw, model.id, startTime);
      break;
    case 'local':
      response = normaliseOllama(raw, model.id, startTime);
      break;
  }

  // Compute cost if not provided by the provider
  if (response.cost_usd === null || response.cost_usd === undefined) {
    response.cost_usd = computeCost(response.usage, model);
  }

  return response;
}

async function dispatch(resolved, messages, system, extra) {
  const { model, fallback, overrides } = resolved;

  try {
    return await dispatchToModel(model, messages, system, overrides, extra);
  } catch (err) {
    if (fallback) {
      console.warn(`dispatch: ${model.id} failed (${err.message}), trying fallback ${fallback.id}`);
      try {
        return await dispatchToModel(fallback, messages, system, overrides, extra);
      } catch (fallbackErr) {
        throw new Error(`Both ${model.id} and fallback ${fallback.id} failed: ${fallbackErr.message}`);
      }
    }
    throw err;
  }
}

module.exports = { dispatch };
