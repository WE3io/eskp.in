const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

let _config = null;

const REQUIRED_MODEL_FIELDS = ['type'];
const VALID_TYPES = ['openrouter', 'anthropic', 'local'];

function validate(config) {
  const errors = [];

  // Validate models
  if (!config.models || typeof config.models !== 'object') {
    errors.push('models.yaml: missing or invalid "models" section');
    return errors;
  }

  for (const [id, model] of Object.entries(config.models)) {
    for (const field of REQUIRED_MODEL_FIELDS) {
      if (!model[field]) errors.push(`models.${id}: missing required field "${field}"`);
    }
    if (model.type && !VALID_TYPES.includes(model.type)) {
      errors.push(`models.${id}: invalid type "${model.type}" (must be ${VALID_TYPES.join('|')})`);
    }
    if ((model.type === 'openrouter' || model.type === 'anthropic') && !model.model) {
      errors.push(`models.${id}: cloud model missing "model" identifier`);
    }
    if (model.type === 'local' && !model.model_name) {
      errors.push(`models.${id}: local model missing "model_name"`);
    }
  }

  // Validate roles
  if (!config.roles || typeof config.roles !== 'object') {
    errors.push('roles.yaml: missing or invalid "roles" section');
    return errors;
  }

  for (const [role, roleConfig] of Object.entries(config.roles)) {
    if (!roleConfig.default) {
      errors.push(`roles.${role}: missing "default" model reference`);
      continue;
    }
    if (!config.models[roleConfig.default]) {
      errors.push(`roles.${role}: default model "${roleConfig.default}" not found in models registry`);
    }
    if (roleConfig.fallback && !config.models[roleConfig.fallback]) {
      errors.push(`roles.${role}: fallback model "${roleConfig.fallback}" not found in models registry`);
    }
    if (roleConfig.budget_fallback && !config.models[roleConfig.budget_fallback]) {
      errors.push(`roles.${role}: budget_fallback model "${roleConfig.budget_fallback}" not found in models registry`);
    }
  }

  return errors;
}

function loadConfig(configDir) {
  const dir = configDir || path.join(process.cwd(), 'config');

  const modelsPath = path.join(dir, 'models.yaml');
  const rolesPath = path.join(dir, 'roles.yaml');

  if (!fs.existsSync(modelsPath)) {
    throw new Error(`Config file not found: ${modelsPath}`);
  }
  if (!fs.existsSync(rolesPath)) {
    throw new Error(`Config file not found: ${rolesPath}`);
  }

  const modelsYaml = yaml.load(fs.readFileSync(modelsPath, 'utf8'));
  const rolesYaml = yaml.load(fs.readFileSync(rolesPath, 'utf8'));

  const config = {
    models: modelsYaml.models || {},
    openrouter: modelsYaml.openrouter || {},
    roles: rolesYaml.roles || {},
    version: { models: modelsYaml.version, roles: rolesYaml.version },
  };

  const errors = validate(config);
  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n  ${errors.join('\n  ')}`);
  }

  return Object.freeze(config);
}

function getConfig(configDir) {
  if (!_config) {
    _config = loadConfig(configDir);
  }
  return _config;
}

function resetConfig() {
  _config = null;
}

module.exports = { loadConfig, getConfig, resetConfig };
