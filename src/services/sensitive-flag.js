/**
 * Sensitive-domain detection for human-review routing.
 *
 * Implements TSK-049 / DPIA requirement: goals touching high-risk domains must be
 * held for human review before a helper introduction email is sent.
 *
 * These are NOT hard exclusions — the platform can help with them — but automated
 * matching without human sign-off creates meaningful risk of harm (DPIA, risk 3).
 *
 * Covered domains (from docs/operations/exclusion-register.md Section 2):
 *   1. Mental health / suicidal ideation / self-harm  (highest risk — triggers crisis protocol)
 *   2. Domestic abuse / coercive control              (safety risk from premature disclosure)
 *   3. Child welfare / safeguarding                   (mandatory escalation domain)
 *   4. Grief and bereavement
 *   5. Addiction recovery
 *   6. Eating disorders
 *   7. Relationship breakdown (emotional dimension)
 *
 * Detection philosophy: high recall, acceptable false-positive rate.
 * A false positive means a human reviews a non-sensitive goal — low cost.
 * A false negative means a sensitive goal is auto-matched — potentially harmful.
 *
 * Unlike hard-exclusion.js, these patterns do NOT require personalisation markers
 * on the highest-risk triggers (suicidal ideation, domestic abuse) because the
 * stakes of a miss outweigh the cost of review.
 */

const SENSITIVE_DETECTORS = [
  {
    domain: 'mental_health_crisis',
    label: 'Mental health / suicidal ideation',
    // High recall: any clear signal triggers review. Minor false-positive risk acceptable.
    patterns: [
      /\b(suicide|suicidal|kill\s+myself|end\s+my\s+life|don'?t\s+want\s+to\s+(live|be\s+here|exist))\b/i,
      /\b(self.?harm|harming\s+(myself|yourself)|cutting\s+(myself|yourself))\b/i,
      /\b(want\s+to\s+die|no\s+(reason|point)\s+to\s+(live|go\s+on))\b/i,
      /\bmental\s+(health\s+(crisis|breakdown|emergency)|illness\s+(support|help))\b/i,
      /\b(psychiatric|psychosis|psychotic|sectioned|section\s+[0-9]|detained\s+under\s+the\s+mental\s+health)\b/i,
      /\b(breakdown|nervous\s+breakdown)\b.{0,40}\b(having|experiencing|had|help)\b/i,
    ],
  },
  {
    domain: 'domestic_abuse',
    label: 'Domestic abuse / coercive control',
    patterns: [
      /\b(domestic\s+abuse|domestic\s+violence|coercive\s+control)\b/i,
      /\b(partner|husband|wife|boyfriend|girlfriend|ex)\b.{0,40}\b(hitting|hitting me|abusing|abusive|threatening|threatening me|controlling|controlling me|violent|violence)\b/i,
      /\b(hitting|abusing|threatening|controlling)\s+(me|us)\b.{0,40}\b(partner|husband|wife)\b/i,
      /\bbeing\s+(hit|hurt|beaten|abused|threatened|controlled)\b.{0,40}\b(by\s+)?(my\s+)?(partner|husband|wife|boyfriend|girlfriend)\b/i,
      /\bafraid\s+of\s+(my\s+)?(partner|husband|wife|boyfriend|girlfriend)\b/i,
      /\b(leave|leaving|escape|escaping)\b.{0,40}\b(abusive|abuser|violent\s+partner|domestic)\b/i,
      /\bhe\s+(hits|hurts|threatens|controls|abuses)\s+me\b/i,
      /\bshe\s+(hits|hurts|threatens|controls|abuses)\s+me\b/i,
    ],
  },
  {
    domain: 'child_safeguarding',
    label: 'Child welfare / safeguarding',
    patterns: [
      /\b(child\s+(abuse|safeguarding|at\s+risk|being\s+abused|neglect))\b/i,
      /\b(safeguarding\s+(concern|issue|referral|report))\b/i,
      /\bworried\s+about\s+(a\s+)?(child|children|young\s+person|my\s+(child|son|daughter|kid))\b.{0,60}\b(safe|hurt|harm|abuse|neglect)\b/i,
      /\b(report|reporting)\b.{0,40}\b(child\s+abuse|safeguarding|child\s+at\s+risk)\b/i,
      /\bchild\s+being\s+(harmed|hurt|abused|neglected)\b/i,
    ],
  },
  {
    domain: 'grief_bereavement',
    label: 'Grief and bereavement',
    patterns: [
      /\b(recently\s+lost|just\s+lost)\b.{0,40}\b(my\s+)?(partner|husband|wife|mother|father|mum|dad|child|son|daughter|friend|sibling|brother|sister)\b/i,
      /\b(bereavement|grieving|grief)\b.{0,40}\b(help|support|cope|coping|dealing)\b/i,
      /\b(died|passed\s+away|death)\b.{0,40}\b(my\s+)?(partner|husband|wife|mother|father|mum|dad|child|son|daughter|friend)\b/i,
      /\bmy\s+(partner|husband|wife|mother|father|mum|dad|child|son|daughter)\b.{0,40}\b(died|passed\s+away|death|lost)\b/i,
    ],
  },
  {
    domain: 'addiction',
    label: 'Addiction recovery',
    patterns: [
      /\b(recovering|recovery)\s+from\b.{0,40}\b(addiction|alcohol|drugs?|substance)\b/i,
      /\b(alcohol|drug)\s+(addiction|dependency|dependence|problem|abuse)\b.{0,40}\b(help|support|overcome|struggling)\b/i,
      /\baddicted\s+to\b.{0,40}\b(alcohol|drugs?|substances?|gambling)\b/i,
      /\b(stop\s+drinking|sober|sobriety)\b.{0,40}\b(help|support|struggling|maintain)\b/i,
      /\bstruggling\s+with\b.{0,40}\b(alcohol|addiction|substance)\b/i,
    ],
  },
  {
    domain: 'eating_disorder',
    label: 'Eating disorder',
    patterns: [
      /\b(anorexia|bulimia|binge\s+eating\s+disorder|arfid|orthorexia)\b/i,
      /\beating\s+disorder\b/i,
      /\b(not\s+eating|restricting\s+(my\s+)?food|purging|bingeing)\b.{0,40}\b(help|support|recover|struggling)\b/i,
      /\bstruggling\s+with\b.{0,40}\b(eating|food|my\s+body|body\s+image)\b.{0,40}\b(help|support|disorder)\b/i,
    ],
  },
  {
    domain: 'relationship_breakdown',
    label: 'Relationship breakdown (emotional support)',
    // Narrower patterns — only where emotional harm is the primary concern
    patterns: [
      /\b(divorce|separation|separating)\b.{0,60}\b(cope|coping|help\s+me|emotional|feeling|devastated|heartbroken|support)\b/i,
      /\b(heartbroken|devastated)\b.{0,40}\b(marriage|relationship|partner|divorce|separation)\b/i,
      /\bending\s+(my\s+)?(marriage|relationship|long[\s-]term\s+relationship)\b.{0,40}\b(cope|help|support|feeling|emotional)\b/i,
    ],
  },
];

/**
 * Check whether goalText touches a sensitive domain requiring human review.
 *
 * @param {string} goalText
 * @returns {{ flagged: boolean, domain?: string, label?: string }}
 */
function detectSensitiveDomain(goalText) {
  if (!goalText || typeof goalText !== 'string') {
    return { flagged: false };
  }

  for (const detector of SENSITIVE_DETECTORS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(goalText)) {
        return {
          flagged: true,
          domain: detector.domain,
          label: detector.label,
        };
      }
    }
  }

  return { flagged: false };
}

module.exports = { detectSensitiveDomain };
