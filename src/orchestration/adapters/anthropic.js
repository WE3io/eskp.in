const Anthropic = require('@anthropic-ai/sdk');

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

async function dispatch(model, messages, system, overrides, extra) {
  const client = getClient();

  const params = {
    model: model.model,
    messages,
    max_tokens: overrides.max_tokens || (model.constraints && model.constraints.max_output_tokens) || 4096,
  };

  if (system) params.system = system;
  if (overrides.temperature !== undefined) params.temperature = overrides.temperature;
  if (extra && extra.tools) params.tools = extra.tools;
  if (extra && extra.tool_choice) params.tool_choice = extra.tool_choice;

  return client.messages.create(params);
}

// For testing: allow replacing the client
function resetClient() {
  _client = null;
}

module.exports = { dispatch, resetClient };
