/**
 * Normalises provider-specific responses into a unified shape.
 */

function normaliseOpenRouter(raw, modelId, startTime) {
  const choice = raw.choices && raw.choices[0];
  const message = choice && choice.message;

  return {
    text: (message && message.content) || null,
    tool_calls: ((message && message.tool_calls) || []).map(tc => ({
      id: tc.id,
      name: tc.function.name,
      arguments: typeof tc.function.arguments === 'string'
        ? JSON.parse(tc.function.arguments)
        : tc.function.arguments,
    })),
    stop_reason: mapStopReason(choice && choice.finish_reason),
    usage: {
      input_tokens: (raw.usage && raw.usage.prompt_tokens) || 0,
      output_tokens: (raw.usage && raw.usage.completion_tokens) || 0,
    },
    cost_usd: (raw.usage && raw.usage.cost) || null,
    model_id: modelId,
    actual_model: raw.model || modelId,
    provider: 'openrouter',
    latency_ms: Date.now() - startTime,
  };
}

function normaliseAnthropic(raw, modelId, startTime) {
  const textBlock = raw.content && raw.content.find(b => b.type === 'text');

  return {
    text: (textBlock && textBlock.text) || null,
    tool_calls: (raw.content || []).filter(b => b.type === 'tool_use').map(b => ({
      id: b.id,
      name: b.name,
      arguments: b.input,
    })),
    stop_reason: mapStopReason(raw.stop_reason),
    usage: {
      input_tokens: (raw.usage && raw.usage.input_tokens) || 0,
      output_tokens: (raw.usage && raw.usage.output_tokens) || 0,
    },
    cost_usd: null, // computed from config pricing in ledger
    model_id: modelId,
    actual_model: raw.model || modelId,
    provider: 'anthropic',
    latency_ms: Date.now() - startTime,
  };
}

function normaliseOllama(raw, modelId, startTime) {
  const message = raw.message || {};

  return {
    text: message.content || null,
    tool_calls: [],
    stop_reason: raw.done ? 'end' : 'error',
    usage: {
      input_tokens: raw.prompt_eval_count || 0,
      output_tokens: raw.eval_count || 0,
    },
    cost_usd: 0, // local models are free
    model_id: modelId,
    actual_model: raw.model || modelId,
    provider: 'ollama',
    latency_ms: Date.now() - startTime,
  };
}

function mapStopReason(reason) {
  const map = {
    'stop': 'end',
    'end_turn': 'end',
    'tool_calls': 'tool_use',
    'tool_use': 'tool_use',
    'length': 'max_tokens',
    'max_tokens': 'max_tokens',
  };
  return map[reason] || reason || 'end';
}

function computeCost(usage, modelConfig) {
  if (!modelConfig || !modelConfig.cost) return 0;
  const inputCost = (usage.input_tokens / 1_000_000) * modelConfig.cost.input_per_mtok;
  const outputCost = (usage.output_tokens / 1_000_000) * modelConfig.cost.output_per_mtok;
  return inputCost + outputCost;
}

module.exports = {
  normaliseOpenRouter,
  normaliseAnthropic,
  normaliseOllama,
  computeCost,
};
