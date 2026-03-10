const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../db/connection');
const { detectSensitiveDomain } = require('./sensitive-flag');

/**
 * Find the best helper for a decomposed goal.
 * Uses Claude Haiku for semantic relevance scoring.
 * Falls back to tag-overlap if the AI call fails.
 *
 * Defence in depth (TSK-036): if the decomposed summary contains sensitive-domain
 * signals, use local tag-overlap only. The sensitive-domain detector in webhooks.js
 * catches most cases before decomposition, but this layer catches any that slip
 * through (e.g. sensitivity surfaced only after AI decomposition).
 */

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HAIKU_INPUT_PRICE  = 0.80 / 1_000_000;
const HAIKU_OUTPUT_PRICE = 4.00 / 1_000_000;

// Tool definition: enforces ranked output schema via API, eliminating JSON parse errors
const RANK_HELPERS_TOOL = {
  name: 'rank_helpers',
  description: 'Rank helpers by relevance to the goal, returning scored results.',
  input_schema: {
    type: 'object',
    properties: {
      ranked: {
        type: 'array',
        description: 'Helpers ranked by relevance, highest score first.',
        items: {
          type: 'object',
          properties: {
            helper_id: { type: 'string', description: 'UUID of the helper' },
            score: { type: 'number', description: 'Relevance score 0-100' },
            reason: { type: 'string', description: 'One sentence explaining the score' },
          },
          required: ['helper_id', 'score', 'reason'],
        },
      },
    },
    required: ['ranked'],
  },
};

async function findMatches(decomposed, { localOnly = false } = {}) {
  const { rows: helpers } = await pool.query(`
    SELECT
      h.id AS helper_id,
      u.name,
      u.email,
      h.expertise,
      h.bio
    FROM helpers h
    JOIN users u ON u.id = h.user_id
    WHERE h.is_active = TRUE
      AND u.deleted_at IS NULL
    ORDER BY h.created_at ASC
  `);

  if (helpers.length === 0) return [];
  if (helpers.length === 1) return helpers;

  // TSK-036: defence-in-depth — skip LLM matching if the summary contains sensitive signals.
  // Avoids sending potentially sensitive content to an external API a second time.
  if (!localOnly) {
    const summaryCheck = detectSensitiveDomain(decomposed.summary || '');
    if (summaryCheck.flagged) {
      console.log(`match: sensitive domain '${summaryCheck.domain}' detected in summary — using local tag-overlap only`);
      localOnly = true;
    }
  }

  if (localOnly) {
    return tagOverlapRank(decomposed, helpers);
  }

  try {
    return await semanticRank(decomposed, helpers);
  } catch (err) {
    console.warn('match: semantic ranking failed, falling back to tag-overlap:', err.message);
    return tagOverlapRank(decomposed, helpers);
  }
}

async function semanticRank(decomposed, helpers) {
  const helperList = helpers.map((h, i) =>
    `Helper ${i + 1} (id: ${h.helper_id})\n` +
    `Name: ${h.name || 'anonymous'}\n` +
    `Expertise: ${h.expertise.join(', ') || 'not specified'}\n` +
    `Bio: ${h.bio || 'not provided'}`
  ).join('\n\n');

  // Data minimisation: send only the summary and expertise tags to the external API,
  // not the full context or outcome which may contain personal background information.
  const needsSummary = decomposed.needs
    .map(n => `- ${n.need} (tags: ${n.expertise.join(', ') || 'none'}) [urgency: ${n.urgency}]`)
    .join('\n');

  const prompt = `You are a matching engine. Given a goal summary and a list of helpers, call the rank_helpers tool to rank them by relevance.

GOAL SUMMARY: ${decomposed.summary}

NEEDS:
${needsSummary}

HELPERS:
${helperList}

Rules:
- Include all helpers in the ranked array
- Score reflects genuine relevance to the needs (0 = no match, 100 = perfect match)
- Prefer helpers whose expertise directly addresses the most urgent needs
- A helper with 0 overlap should score below 20`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    tools: [RANK_HELPERS_TOOL],
    tool_choice: { type: 'tool', name: 'rank_helpers' },
    messages: [{ role: 'user', content: prompt }],
  });

  // Log token usage
  const { input_tokens, output_tokens } = message.usage;
  pool.query(
    `INSERT INTO token_usage (model, input_tokens, output_tokens, operation)
     VALUES ($1, $2, $3, 'match')`,
    ['claude-haiku-4-5-20251001', input_tokens, output_tokens]
  ).catch(err => console.error('token_usage log error (match):', err));

  const toolBlock = message.content.find(c => c.type === 'tool_use');
  if (!toolBlock) throw new Error('Match ranking: no tool_use block in response');

  const { ranked } = toolBlock.input;
  if (!Array.isArray(ranked)) throw new Error('Match ranking: ranked is not an array');

  // Map ranked IDs back to helper objects, in order
  const helperMap = Object.fromEntries(helpers.map(h => [h.helper_id, h]));
  return ranked
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .filter(r => r.score > 0 && helperMap[r.helper_id])
    .map(r => ({ ...helperMap[r.helper_id], reasoning: r.reason, score: r.score }));
}

function normaliseTag(tag) {
  return tag.toLowerCase().replace(/[\s\-\/\.]+/g, ' ').trim();
}

function tagOverlapRank(decomposed, helpers) {
  const allTags = decomposed.needs.flatMap(n => n.expertise).map(normaliseTag);
  return helpers
    .map(h => ({
      ...h,
      overlap: h.expertise.filter(tag => allTags.includes(normaliseTag(tag))).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .filter(h => h.overlap > 0);
}

module.exports = { findMatches };
