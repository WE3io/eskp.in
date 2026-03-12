const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { loadConfig, resetConfig } = require('../config');
const { resolveRole, getModel, listModels, getModelsByType } = require('../registry');

// Integration tests that verify config → registry → role resolution
// without hitting any external APIs.

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'orch-integ-'));
}

function writeYaml(dir, name, content) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

const MODELS_YAML = `
version: 1
openrouter:
  api_key_env: OPENROUTER_API_KEY
  base_url: "https://openrouter.ai/api/v1"
  app_url: "https://test.example"
  app_name: "test"
models:
  fast-cloud:
    type: openrouter
    model: "anthropic/claude-haiku-4-5-20251001"
    capabilities: [text, json_output]
    cost:
      input_per_mtok: 0.80
      output_per_mtok: 4.00
  fallback-cloud:
    type: anthropic
    model: "claude-haiku-4-5-20251001"
    cost:
      input_per_mtok: 0.80
      output_per_mtok: 4.00
  local-model:
    type: local
    model_name: "llama3"
    endpoint: "http://localhost:11434"
    cost:
      input_per_mtok: 0
      output_per_mtok: 0
`;

const ROLES_YAML = `
version: 1
roles:
  decomposer:
    default: fast-cloud
    fallback: fallback-cloud
    max_tokens: 1024
    temperature: 0
    budget:
      monthly_usd: 5.00
  matcher:
    default: fast-cloud
    max_tokens: 512
    temperature: 0
  local-task:
    default: local-model
    max_tokens: 256
    temperature: 0
`;

describe('integration: config → registry', () => {
  let tmpDir;
  let config;

  beforeEach(() => {
    resetConfig();
    tmpDir = makeTmpDir();
    writeYaml(tmpDir, 'models.yaml', MODELS_YAML);
    writeYaml(tmpDir, 'roles.yaml', ROLES_YAML);
    config = loadConfig(tmpDir);
  });

  it('resolves decomposer role with fallback', () => {
    const resolved = resolveRole('decomposer', config);

    assert.equal(resolved.model.id, 'fast-cloud');
    assert.equal(resolved.model.type, 'openrouter');
    assert.ok(resolved.fallback);
    assert.equal(resolved.fallback.id, 'fallback-cloud');
    assert.equal(resolved.fallback.type, 'anthropic');
    assert.equal(resolved.overrides.max_tokens, 1024);
    assert.equal(resolved.overrides.temperature, 0);
    assert.equal(resolved.budget.monthly_usd, 5.00);
    assert.equal(resolved.role, 'decomposer');
  });

  it('resolves matcher role without fallback', () => {
    const resolved = resolveRole('matcher', config);

    assert.equal(resolved.model.id, 'fast-cloud');
    assert.equal(resolved.fallback, null);
    assert.equal(resolved.overrides.max_tokens, 512);
  });

  it('resolves local-task to ollama model', () => {
    const resolved = resolveRole('local-task', config);

    assert.equal(resolved.model.id, 'local-model');
    assert.equal(resolved.model.type, 'local');
    assert.equal(resolved.model.model_name, 'llama3');
    assert.equal(resolved.fallback, null);
  });

  it('throws for unknown role', () => {
    assert.throws(() => resolveRole('nonexistent', config), /not found in configuration/);
  });

  it('getModel returns model with id', () => {
    const model = getModel('fast-cloud', config);
    assert.equal(model.id, 'fast-cloud');
    assert.equal(model.type, 'openrouter');
    assert.equal(model.model, 'anthropic/claude-haiku-4-5-20251001');
  });

  it('getModel throws for unknown model', () => {
    assert.throws(() => getModel('nope', config), /not found in registry/);
  });

  it('listModels returns all models', () => {
    const models = listModels(config);
    assert.equal(models.length, 3);
    const ids = models.map(m => m.id);
    assert.ok(ids.includes('fast-cloud'));
    assert.ok(ids.includes('fallback-cloud'));
    assert.ok(ids.includes('local-model'));
  });

  it('getModelsByType filters by provider', () => {
    const orModels = getModelsByType('openrouter', config);
    assert.equal(orModels.length, 1);
    assert.equal(orModels[0].id, 'fast-cloud');

    const localModels = getModelsByType('local', config);
    assert.equal(localModels.length, 1);
    assert.equal(localModels[0].id, 'local-model');
  });

  it('config includes openrouter global settings', () => {
    assert.equal(config.openrouter.app_url, 'https://test.example');
    assert.equal(config.openrouter.app_name, 'test');
  });
});
