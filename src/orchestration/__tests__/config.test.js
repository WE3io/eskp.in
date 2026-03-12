const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { loadConfig, resetConfig } = require('../config');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'orch-config-'));
}

function writeYaml(dir, name, content) {
  fs.writeFileSync(path.join(dir, name), content, 'utf8');
}

const VALID_MODELS = `
version: 1
openrouter:
  api_key_env: OPENROUTER_API_KEY
models:
  test-model:
    type: openrouter
    model: "anthropic/test"
    cost:
      input_per_mtok: 1
      output_per_mtok: 5
  test-anthropic:
    type: anthropic
    model: "claude-test"
    cost:
      input_per_mtok: 1
      output_per_mtok: 5
`;

const VALID_ROLES = `
version: 1
roles:
  tester:
    default: test-model
    fallback: test-anthropic
    max_tokens: 256
    temperature: 0
`;

describe('config.js', () => {
  let tmpDir;

  beforeEach(() => {
    resetConfig();
    tmpDir = makeTmpDir();
  });

  after(() => {
    resetConfig();
  });

  it('loads valid models.yaml and roles.yaml', () => {
    writeYaml(tmpDir, 'models.yaml', VALID_MODELS);
    writeYaml(tmpDir, 'roles.yaml', VALID_ROLES);

    const config = loadConfig(tmpDir);
    assert.ok(config.models['test-model']);
    assert.equal(config.models['test-model'].type, 'openrouter');
    assert.ok(config.roles['tester']);
    assert.equal(config.roles['tester'].default, 'test-model');
    assert.equal(config.version.models, 1);
  });

  it('throws when models.yaml is missing', () => {
    writeYaml(tmpDir, 'roles.yaml', VALID_ROLES);
    assert.throws(() => loadConfig(tmpDir), /Config file not found/);
  });

  it('throws when roles.yaml is missing', () => {
    writeYaml(tmpDir, 'models.yaml', VALID_MODELS);
    assert.throws(() => loadConfig(tmpDir), /Config file not found/);
  });

  it('throws when model has invalid type', () => {
    writeYaml(tmpDir, 'models.yaml', `
version: 1
models:
  bad-model:
    type: invalid_provider
    model: "test"
`);
    writeYaml(tmpDir, 'roles.yaml', `
version: 1
roles:
  tester:
    default: bad-model
`);

    assert.throws(() => loadConfig(tmpDir), /invalid type/);
  });

  it('throws when cloud model missing model identifier', () => {
    writeYaml(tmpDir, 'models.yaml', `
version: 1
models:
  bad-model:
    type: openrouter
`);
    writeYaml(tmpDir, 'roles.yaml', `
version: 1
roles:
  tester:
    default: bad-model
`);

    assert.throws(() => loadConfig(tmpDir), /missing "model" identifier/);
  });

  it('throws when local model missing model_name', () => {
    writeYaml(tmpDir, 'models.yaml', `
version: 1
models:
  bad-local:
    type: local
`);
    writeYaml(tmpDir, 'roles.yaml', `
version: 1
roles:
  tester:
    default: bad-local
`);

    assert.throws(() => loadConfig(tmpDir), /missing "model_name"/);
  });

  it('throws when role references non-existent model', () => {
    writeYaml(tmpDir, 'models.yaml', VALID_MODELS);
    writeYaml(tmpDir, 'roles.yaml', `
version: 1
roles:
  tester:
    default: nonexistent-model
`);

    assert.throws(() => loadConfig(tmpDir), /not found in models registry/);
  });

  it('throws when role references non-existent fallback', () => {
    writeYaml(tmpDir, 'models.yaml', VALID_MODELS);
    writeYaml(tmpDir, 'roles.yaml', `
version: 1
roles:
  tester:
    default: test-model
    fallback: nonexistent-fallback
`);

    assert.throws(() => loadConfig(tmpDir), /not found in models registry/);
  });

  it('returns frozen config', () => {
    writeYaml(tmpDir, 'models.yaml', VALID_MODELS);
    writeYaml(tmpDir, 'roles.yaml', VALID_ROLES);

    const config = loadConfig(tmpDir);
    assert.ok(Object.isFrozen(config));
  });
});
