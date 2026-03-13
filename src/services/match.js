const logger = require('../logger');
const { pool } = require('../db/connection');
const { detectSensitiveDomain } = require('./sensitive-flag');
const { infer } = require('../orchestration');

/**
 * Find the best helper for a decomposed goal.
 * Uses semantic relevance scoring via the orchestration layer.
 * Falls back to tag-overlap if the AI call fails.
 *
 * Defence in depth (TSK-036): if the decomposed summary contains sensitive-domain
 * signals, use local tag-overlap only. The sensitive-domain detector in webhooks.js
 * catches most cases before decomposition, but this layer catches any that slip
 * through (e.g. sensitivity surfaced only after AI decomposition).
 */

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
      AND array_length(h.expertise, 1) > 0
    ORDER BY h.created_at ASC
  `);

  if (helpers.length === 0) return [];
  if (helpers.length === 1) return helpers;

  // TSK-036: defence-in-depth — skip LLM matching if the summary contains sensitive signals.
  // Avoids sending potentially sensitive content to an external API a second time.
  if (!localOnly) {
    const summaryCheck = detectSensitiveDomain(decomposed.summary || '');
    if (summaryCheck.flagged) {
      logger.info({ domain: summaryCheck.domain }, 'match: sensitive domain detected in summary — using local tag-overlap only');
      localOnly = true;
    }
  }

  if (localOnly) {
    return tagOverlapRank(decomposed, helpers);
  }

  try {
    return await semanticRank(decomposed, helpers);
  } catch (err) {
    logger.warn({ err }, 'match: semantic ranking failed, falling back to tag-overlap');
    return tagOverlapRank(decomposed, helpers);
  }
}

async function semanticRank(decomposed, helpers) {
  // Data minimisation: helper names omitted to prevent bias in automated ranking (Art 3.2/3.3)
  const helperList = helpers.map((h, i) =>
    `Helper ${i + 1} (id: ${h.helper_id})\n` +
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

  const response = await infer({
    role: 'matcher',
    messages: [{ role: 'user', content: prompt }],
    tools: [RANK_HELPERS_TOOL],
    tool_choice: { type: 'tool', name: 'rank_helpers' },
  });

  // Extract tool_use result from normalised response
  const toolCall = response.tool_calls && response.tool_calls[0];
  if (!toolCall) throw new Error('Match ranking: no tool_use block in response');

  const { ranked } = toolCall.arguments;
  if (!Array.isArray(ranked)) throw new Error('Match ranking: ranked is not an array');

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
