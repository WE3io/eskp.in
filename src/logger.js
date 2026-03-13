const pino = require('pino');

// PII redaction: scrub email addresses and goal content from logs
const redactPaths = [
  'email',
  'userEmail',
  'from_address',
  'to_address',
  'raw_text',
  'content',
  'req.headers.authorization',
];

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  // Deterministic key order for structured logs
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
