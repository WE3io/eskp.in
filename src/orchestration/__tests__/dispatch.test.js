const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

// We test dispatch.js by mocking the adapters and response module.
// Since dispatch.js requires the adapters at module level, we use
// node:test's mock to intercept the calls.

const { normaliseOpenRouter, normaliseAnthropic, normaliseOllama, computeCost } = require('../response');

describe('dispatch.js', () => {

  describe('dispatchToModel routing', () => {
    // We test via the exported dispatch() function which calls dispatchToModel internally.
    // We need to mock the adapter modules.

    it('throws for unknown model type', async () => {
      // Fresh require with mock
      const { dispatch } = require('../dispatch');

      const resolved = {
        model: { id: 'test', type: 'unknown_provider' },
        fallback: null,
        overrides: {},
      };

      await assert.rejects(
        () => dispatch(resolved, [{ role: 'user', content: 'hi' }], null),
        /No adapter for model type/
      );
    });
  });

  describe('fallback behavior', () => {
    it('tries fallback when primary fails', async () => {
      // We can test the dispatch logic by checking the fallback error message
      // Since we can't easily mock the adapters without controlling their import,
      // we test via the error path where both fail.

      const { dispatch } = require('../dispatch');

      // Use a model type that exists but will fail (no API key set)
      const resolved = {
        model: { id: 'primary', type: 'anthropic', model: 'test' },
        fallback: { id: 'fallback', type: 'anthropic', model: 'test' },
        overrides: { max_tokens: 100 },
      };

      // Both will fail because there's no API key — but we verify the message mentions both
      await assert.rejects(
        () => dispatch(resolved, [{ role: 'user', content: 'hi' }], null),
        /Both primary and fallback fallback failed/
      );
    });
  });
});

describe('response.js normalisation', () => {
  const startTime = Date.now() - 100; // 100ms ago

  it('normalises OpenRouter response', () => {
    const raw = {
      choices: [{ message: { content: 'Hello', tool_calls: [] }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
      model: 'test-model',
    };
    const result = normaliseOpenRouter(raw, 'my-model', startTime);
    assert.equal(result.text, 'Hello');
    assert.equal(result.stop_reason, 'end');
    assert.equal(result.usage.input_tokens, 10);
    assert.equal(result.usage.output_tokens, 5);
    assert.equal(result.provider, 'openrouter');
    assert.equal(result.model_id, 'my-model');
    assert.ok(result.latency_ms >= 0);
  });

  it('normalises Anthropic response', () => {
    const raw = {
      content: [
        { type: 'text', text: 'World' },
        { type: 'tool_use', id: 't1', name: 'search', input: { q: 'test' } },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 20, output_tokens: 15 },
      model: 'claude-test',
    };
    const result = normaliseAnthropic(raw, 'anthropic-model', startTime);
    assert.equal(result.text, 'World');
    assert.equal(result.tool_calls.length, 1);
    assert.equal(result.tool_calls[0].name, 'search');
    assert.equal(result.stop_reason, 'end');
    assert.equal(result.usage.input_tokens, 20);
    assert.equal(result.provider, 'anthropic');
  });

  it('normalises Ollama response', () => {
    const raw = {
      message: { content: 'Local response' },
      done: true,
      prompt_eval_count: 30,
      eval_count: 25,
      model: 'llama3',
    };
    const result = normaliseOllama(raw, 'local-model', startTime);
    assert.equal(result.text, 'Local response');
    assert.equal(result.stop_reason, 'end');
    assert.equal(result.usage.input_tokens, 30);
    assert.equal(result.usage.output_tokens, 25);
    assert.equal(result.cost_usd, 0);
    assert.equal(result.provider, 'ollama');
  });

  it('normalises OpenRouter tool_calls from OpenAI format to unified format', () => {
    const raw = {
      choices: [{
        message: {
          content: null,
          tool_calls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'decompose_goal',
                arguments: '{"summary":"Test goal","needs":[]}',
              },
            },
            {
              id: 'call_456',
              type: 'function',
              function: {
                name: 'rank_helpers',
                arguments: { ranked: [] }, // pre-parsed object
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
      }],
      usage: { prompt_tokens: 50, completion_tokens: 30 },
      model: 'anthropic/claude-haiku',
    };
    const result = normaliseOpenRouter(raw, 'haiku-openrouter', startTime);

    assert.equal(result.tool_calls.length, 2);

    // First tool call: arguments was a JSON string, should be parsed
    assert.equal(result.tool_calls[0].id, 'call_123');
    assert.equal(result.tool_calls[0].name, 'decompose_goal');
    assert.deepEqual(result.tool_calls[0].arguments, { summary: 'Test goal', needs: [] });

    // Second tool call: arguments was already an object, should pass through
    assert.equal(result.tool_calls[1].id, 'call_456');
    assert.equal(result.tool_calls[1].name, 'rank_helpers');
    assert.deepEqual(result.tool_calls[1].arguments, { ranked: [] });

    assert.equal(result.stop_reason, 'tool_use');
  });

  it('handles empty/null responses gracefully', () => {
    const result = normaliseOpenRouter({}, 'model', startTime);
    assert.equal(result.text, null);
    assert.deepEqual(result.tool_calls, []);
    assert.equal(result.usage.input_tokens, 0);
  });

  it('maps stop reasons correctly', () => {
    const r1 = normaliseOpenRouter(
      { choices: [{ message: { content: '' }, finish_reason: 'length' }], usage: {} },
      'm', startTime
    );
    assert.equal(r1.stop_reason, 'max_tokens');

    const r2 = normaliseAnthropic(
      { content: [{ type: 'text', text: '' }], stop_reason: 'tool_use', usage: {} },
      'm', startTime
    );
    assert.equal(r2.stop_reason, 'tool_use');
  });

  it('computeCost calculates correctly', () => {
    const usage = { input_tokens: 1000, output_tokens: 500 };
    const model = { cost: { input_per_mtok: 0.80, output_per_mtok: 4.00 } };
    const cost = computeCost(usage, model);
    // 1000/1M * 0.80 + 500/1M * 4.00 = 0.0008 + 0.002 = 0.0028
    assert.ok(Math.abs(cost - 0.0028) < 0.0001);
  });

  it('computeCost returns 0 for missing config', () => {
    assert.equal(computeCost({ input_tokens: 100, output_tokens: 50 }, null), 0);
    assert.equal(computeCost({ input_tokens: 100, output_tokens: 50 }, {}), 0);
  });
});
