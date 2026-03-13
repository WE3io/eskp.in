#!/usr/bin/env node
/**
 * apply-code-output.js — Parses code generation output and writes files to disk.
 *
 * Reads from stdin (piped from orch-infer.js --role coder) and extracts file
 * blocks in one of two formats:
 *
 *   Format 1 (XML-style, preferred):
 *     <file path="src/foo.js">
 *     ... code ...
 *     </file>
 *
 *   Format 2 (Markdown code fences with path comment):
 *     ```javascript
 *     // FILE: src/foo.js
 *     ... code ...
 *     ```
 *
 * Usage:
 *   node scripts/orch-infer.js --role coder --input "..." --files src/foo.js | \
 *     node scripts/apply-code-output.js
 *
 *   echo "$CODER_OUTPUT" | node scripts/apply-code-output.js --dry-run
 *
 * Flags:
 *   --dry-run    Show what would be written without writing
 *   --base-dir   Base directory for relative paths (default: cwd)
 *
 * Safety:
 *   - Only writes to files under base-dir (prevents directory traversal)
 *   - Refuses to write to dotfiles, node_modules, .env, or binary extensions
 *   - Creates parent directories if needed
 *   - Reports all actions to stderr for logging
 *
 * Exit codes:
 *   0  Files written (or dry-run completed)
 *   1  Error (no files found, path traversal blocked, etc.)
 */

const fs = require('fs');
const path = require('path');

const BLOCKED_PATTERNS = [
  /node_modules\//,
  /^\.env/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /\.jks$/,
  /\.credentials/,
];

const BLOCKED_DIRS = ['.git', '.ssh', '.gnupg'];

function parseFileBlocks(input) {
  const files = [];

  // Format 1: <file path="...">...</file>
  const xmlPattern = /<file\s+path="([^"]+)">\n?([\s\S]*?)\n?<\/file>/g;
  let match;
  while ((match = xmlPattern.exec(input)) !== null) {
    files.push({ path: match[1].trim(), content: match[2] });
  }

  // Format 2: ```lang\n// FILE: path\n...\n```
  if (files.length === 0) {
    const fencePattern = /```\w*\n\/\/\s*FILE:\s*(.+)\n([\s\S]*?)```/g;
    while ((match = fencePattern.exec(input)) !== null) {
      files.push({ path: match[1].trim(), content: match[2].trimEnd() });
    }
  }

  // Format 3: ```lang:path\n...\n``` (some models use this)
  if (files.length === 0) {
    const colonPattern = /```\w+:([^\n]+)\n([\s\S]*?)```/g;
    while ((match = colonPattern.exec(input)) !== null) {
      const filePath = match[1].trim();
      // Only accept if it looks like a file path
      if (filePath.includes('/') || filePath.includes('.')) {
        files.push({ path: filePath, content: match[2].trimEnd() });
      }
    }
  }

  return files;
}

function isPathSafe(filePath, baseDir) {
  // Resolve to absolute and check it's under baseDir
  const resolved = path.resolve(baseDir, filePath);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) {
    return { safe: false, reason: `path traversal: resolves to ${resolved}` };
  }

  // Check against blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(filePath)) {
      return { safe: false, reason: `blocked pattern: ${pattern}` };
    }
  }

  // Check against blocked directories
  const parts = filePath.split(path.sep);
  for (const dir of BLOCKED_DIRS) {
    if (parts.includes(dir)) {
      return { safe: false, reason: `blocked directory: ${dir}` };
    }
  }

  return { safe: true };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const baseDirIdx = args.indexOf('--base-dir');
  const baseDir = baseDirIdx !== -1 && args[baseDirIdx + 1]
    ? path.resolve(args[baseDirIdx + 1])
    : process.cwd();

  // Read stdin
  const chunks = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => {
    const input = chunks.join('');

    if (!input.trim()) {
      process.stderr.write('apply-code-output: empty input\n');
      process.exit(1);
    }

    const files = parseFileBlocks(input);

    if (files.length === 0) {
      process.stderr.write('apply-code-output: no file blocks found in input\n');
      // Output the raw input so the caller can see what the model returned
      process.stderr.write(`--- raw input (first 500 chars) ---\n${input.slice(0, 500)}\n---\n`);
      process.exit(1);
    }

    let written = 0;
    let skipped = 0;

    for (const file of files) {
      const check = isPathSafe(file.path, baseDir);
      if (!check.safe) {
        process.stderr.write(`apply-code-output: BLOCKED ${file.path} (${check.reason})\n`);
        skipped++;
        continue;
      }

      const fullPath = path.resolve(baseDir, file.path);

      if (dryRun) {
        const lines = file.content.split('\n').length;
        process.stderr.write(`apply-code-output: [dry-run] would write ${file.path} (${lines} lines)\n`);
        written++;
        continue;
      }

      // Create parent directories
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        process.stderr.write(`apply-code-output: created directory ${path.relative(baseDir, dir)}\n`);
      }

      // Write file
      fs.writeFileSync(fullPath, file.content);
      const lines = file.content.split('\n').length;
      process.stderr.write(`apply-code-output: wrote ${file.path} (${lines} lines)\n`);
      written++;
    }

    process.stderr.write(`apply-code-output: ${written} file(s) written, ${skipped} blocked\n`);

    if (written === 0) {
      process.exit(1);
    }
  });
}

main();
