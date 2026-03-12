const https = require('https');
const { getConfig } = require('../config');

function buildHeaders(config) {
  const apiKey = process.env[config.openrouter.api_key_env || 'OPENROUTER_API_KEY'];
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': config.openrouter.app_url || '',
    'X-Title': config.openrouter.app_name || '',
  };
}

function buildBody(model, messages, system, overrides, extra) {
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  msgs.push(...messages);

  const body = {
    model: model.model,
    messages: msgs,
    max_tokens: overrides.max_tokens || (model.constraints && model.constraints.max_output_tokens) || 4096,
  };

  if (overrides.temperature !== undefined) body.temperature = overrides.temperature;

  // Tool use support (OpenAI format: tools + tool_choice)
  if (extra && extra.tools) {
    // Convert Anthropic tool format to OpenAI function-calling format
    body.tools = extra.tools.map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }));
  }
  if (extra && extra.tool_choice) {
    // Convert Anthropic tool_choice to OpenAI format
    if (extra.tool_choice.type === 'tool') {
      body.tool_choice = { type: 'function', function: { name: extra.tool_choice.name } };
    } else {
      body.tool_choice = extra.tool_choice.type || 'auto';
    }
  }

  // Merge provider preferences: global → per-model → strategy
  const config = getConfig();
  const globalProvider = config.openrouter.global_provider || {};
  const modelProvider = model.provider || {};
  const provider = { ...globalProvider, ...modelProvider };
  if (Object.keys(provider).length > 0) body.provider = provider;

  // Model-level fallbacks
  if (model.fallbacks && model.fallbacks.length > 0) {
    body.models = [model.model, ...model.fallbacks];
    body.route = 'fallback';
    delete body.model;
  }

  return body;
}

function dispatch(model, messages, system, overrides, extra) {
  const config = getConfig();
  const baseUrl = new URL(config.openrouter.base_url || 'https://openrouter.ai/api/v1');
  const timeout = config.openrouter.request_timeout_ms || 30000;

  return new Promise((resolve, reject) => {
    const body = JSON.stringify(buildBody(model, messages, system, overrides, extra));
    const headers = buildHeaders(config);
    headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request({
      hostname: baseUrl.hostname,
      port: baseUrl.port || 443,
      path: `${baseUrl.pathname}/chat/completions`.replace('//', '/'),
      method: 'POST',
      headers,
      timeout,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const err = new Error(`OpenRouter ${res.statusCode}: ${parsed.error?.message || data}`);
            err.statusCode = res.statusCode;
            err.retryable = [429, 502, 503].includes(res.statusCode);
            reject(err);
          }
        } catch (parseErr) {
          reject(new Error(`OpenRouter response parse error: ${parseErr.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      const err = new Error(`OpenRouter request timed out after ${timeout}ms`);
      err.retryable = true;
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

async function dispatchWithRetry(model, messages, system, overrides, extra) {
  try {
    return await dispatch(model, messages, system, overrides, extra);
  } catch (err) {
    if (err.retryable) {
      // Single retry with backoff
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
      return dispatch(model, messages, system, overrides, extra);
    }
    throw err;
  }
}

module.exports = { dispatch: dispatchWithRetry };
