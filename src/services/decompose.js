const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../db/connection');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a goal decomposition engine for a platform that connects people with helpers.

Your job: take a vague or unclear goal submitted by a user and return a structured JSON object that makes the goal specific and actionable.

Return ONLY valid JSON, no markdown, no explanation. Schema:
{
  "summary": "One clear sentence describing what the person needs",
  "needs": [
    {
      "need": "Specific, concrete need",
      "expertise": ["relevant", "expertise", "tags"],
      "urgency": "low|medium|high"
    }
  ],
  "context": "Brief background that helps a helper understand the situation",
  "outcome": "What success looks like for this person"
}

Rules:
- needs array should have 1–4 items, each independently actionable
- expertise tags should be lowercase, specific (e.g. "contract-law-uk", "react", "financial-planning", "career-transition")
- Never invent facts not present in the submission
- If the submission is too vague to decompose, return a single need asking for clarification`;

async function decompose(rawGoalText, goalId = null) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rawGoalText }],
  });

  // Log token usage locally for budget tracking
  const { input_tokens, output_tokens } = message.usage;
  pool.query(
    `INSERT INTO token_usage (model, input_tokens, output_tokens, operation, goal_id)
     VALUES ($1, $2, $3, 'decompose', $4)`,
    ['claude-haiku-4-5-20251001', input_tokens, output_tokens, goalId]
  ).catch(err => console.error('token_usage log error:', err));

  let text = message.content[0].text.trim();
  // Strip markdown code fences if model wraps output despite instructions
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(text);
}

module.exports = { decompose };
