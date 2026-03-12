const { execFile } = require('child_process');

let _hardwareCache = null;

function runLlmfit(args) {
  return new Promise((resolve, reject) => {
    execFile('llmfit', args, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        if (err.code === 'ENOENT') {
          reject(new Error('llmfit is not installed. Install: pip install llmfit'));
        } else {
          reject(new Error(`llmfit error: ${stderr || err.message}`));
        }
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseErr) {
        reject(new Error(`llmfit output parse error: ${parseErr.message}`));
      }
    });
  });
}

/**
 * Detect hardware capabilities.
 * Returns { gpu, vram_gb, ram_gb, cpu_cores, backend }.
 */
async function detectHardware() {
  if (_hardwareCache) return _hardwareCache;

  try {
    const result = await runLlmfit(['--json', 'system']);
    _hardwareCache = result;
    return result;
  } catch (err) {
    console.warn(`hardware: detection failed — ${err.message}`);
    return null;
  }
}

/**
 * Get model recommendations for a given use case.
 * @param {string} useCase - 'coding' | 'general'
 */
async function recommendModels(useCase) {
  try {
    const args = ['recommend', '--json'];
    if (useCase) args.push('--use-case', useCase);
    return await runLlmfit(args);
  } catch (err) {
    console.warn(`hardware: model recommendations failed — ${err.message}`);
    return [];
  }
}

/**
 * Get models that fit perfectly on the detected hardware.
 */
async function fittingModels() {
  try {
    return await runLlmfit(['fit', '--perfect', '--json']);
  } catch (err) {
    console.warn(`hardware: fitting check failed — ${err.message}`);
    return [];
  }
}

function resetCache() {
  _hardwareCache = null;
}

module.exports = { detectHardware, recommendModels, fittingModels, resetCache };
