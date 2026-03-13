const http = require('http');

function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 30000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (parseErr) {
          reject(new Error(`Ollama response parse error: ${parseErr.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama request timed out'));
    });

    if (body) {
      const bodyStr = JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(bodyStr));
      req.write(bodyStr);
    }
    req.end();
  });
}

async function dispatch(model, messages, system, overrides, extra) {
  const endpoint = model.endpoint || 'http://localhost:11434';
  const modelName = model.model_name;
  if (!modelName) throw new Error('Local model missing "model_name"');

  let effectiveSystem = system || '';
  let toolShimActive = false;
  let toolShimName = null;

  // Tool-use shim: convert tool definitions to JSON schema prompt
  if (extra && extra.tools && extra.tools.length > 0) {
    const tool = extra.tool_choice && extra.tool_choice.name
      ? extra.tools.find(t => t.name === extra.tool_choice.name) || extra.tools[0]
      : extra.tools[0];

    toolShimName = tool.name;
    toolShimActive = true;
    effectiveSystem += '\n\nYou MUST respond with ONLY a valid JSON object matching this exact schema. No other text, no markdown, no explanation.\n\nJSON Schema:\n' + JSON.stringify(tool.input_schema, null, 2);
  }

  // Build Ollama message format
  const ollamaMsgs = [];
  if (effectiveSystem) ollamaMsgs.push({ role: 'system', content: effectiveSystem });
  for (const msg of messages) {
    ollamaMsgs.push({ role: msg.role, content: msg.content });
  }

  const body = {
    model: modelName,
    messages: ollamaMsgs,
    stream: false,
    options: {},
  };

  // Enable JSON mode when tools are present
  if (toolShimActive) {
    body.format = 'json';
  }

  if (overrides.temperature !== undefined) body.options.temperature = overrides.temperature;
  if (overrides.max_tokens) body.options.num_predict = overrides.max_tokens;

  const { statusCode, data } = await httpRequest(
    `${endpoint}/api/chat`,
    { method: 'POST', timeout: 120000 },
    body
  );

  if (statusCode < 200 || statusCode >= 300) {
    const err = new Error(`Ollama ${statusCode}: ${data.error || JSON.stringify(data)}`);
    err.statusCode = statusCode;
    throw err;
  }

  // Tag response for normaliser to wrap as synthetic tool_call
  if (toolShimActive && data.message && data.message.content) {
    data._synthetic_tool_call = {
      name: toolShimName,
      content: data.message.content,
    };
  }

  return data;
}

async function checkHealth(endpoint) {
  try {
    const { statusCode, data } = await httpRequest(
      `${endpoint || 'http://localhost:11434'}/api/tags`,
      { method: 'GET', timeout: 5000 }
    );
    return {
      healthy: statusCode === 200,
      models: (data.models || []).map(m => m.name),
    };
  } catch {
    return { healthy: false, models: [] };
  }
}

module.exports = { dispatch, checkHealth };
