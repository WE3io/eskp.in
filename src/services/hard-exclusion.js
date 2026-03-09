/**
 * Hard exclusion detection and warm referral service.
 *
 * Implements Article 11.1.2 of the Constitution: hard exclusion must be
 * architectural, not optional. This module is called before processGoal()
 * in the email webhook to intercept goals that fall into legally restricted
 * advisory domains.
 *
 * Covered domains (Section 1 of docs/operations/exclusion-register.md):
 *   1. Personalised financial investment / pension recommendations (FSMA 2000 s.23)
 *   2. Legal reserved activities — conveyancing, probate, litigation conduct (LSA 2007 s.14)
 *   3. Immigration advice for specific individuals (IAA 1999 s.91)
 *
 * Detection approach: rule-based pattern matching on the goal text.
 * High-precision design: patterns require BOTH personalisation markers
 * (my, me, for me, should I) AND domain-specific terms to avoid false
 * positives on general information requests.
 *
 * Non-goals: detecting sensitive-handling domains (medical, therapy, etc.) —
 * those proceed through normal flow with professional signposting.
 */

const { send } = require('./email');
const { renderEmail } = require('./email-template');
const { pool } = require('../db/connection');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';

// ---------------------------------------------------------------------------
// Detection patterns
// Each entry: { domain, patterns: RegExp[], referralKey }
// A match on ANY pattern in the array triggers the hard exclusion.
// ---------------------------------------------------------------------------

const DETECTORS = [
  {
    domain: 'financial',
    label: 'Financial investment / pension advice',
    patterns: [
      // "should I invest/put my money/savings/pension..."
      /\bshould\s+i\b.{0,60}\b(invest|put.{0,20}into|pension|isa|fund|shares?|stocks?|drawdown|annuity)\b/i,
      // "advise me on my investments/pension/portfolio/ISA..."
      /\b(advise|advice)\b.{0,40}\bmy\b.{0,40}\b(invest|pension|portfolio|savings|isa|fund|shares?|stocks?)\b/i,
      // "recommend a pension/fund/ISA/investment for me"
      /\b(recommend|suggestion|suggest)\b.{0,60}\b(pension|isa|fund|investment|shares?|stocks?)\b.{0,30}\b(for\s+me|to\s+me)\b/i,
      // "transfer my pension"
      /\btransfer\b.{0,20}\bmy\b.{0,20}\bpension\b/i,
      // "my pension [transfer|drawdown|advice|recommend]"
      /\bmy\s+pension\b.{0,60}\b(transfer|drawdown|annuity|advice|advise|recommend|recommend)\b/i,
      // "best [pension|ISA|fund] for me"
      /\bbest\b.{0,40}\b(pension|isa|fund|investment|shares?|stocks?)\b.{0,30}\bfor\s+me\b/i,
      // "invest my [savings|money|pension|retirement fund]"
      /\binvest\s+my\b.{0,40}\b(savings?|money|cash|pension|retirement)\b/i,
      // "personal financial advice" / "financial advice for me"
      /\bfinancial\s+advice\b.{0,40}\b(for\s+me|my|personal)\b/i,
      // "advise me on what to do with my money/pension"
      /\badvise\s+me\b.{0,60}\b(pension|invest|savings?|isa|portfolio)\b/i,
      // Pension drawdown / annuity decisions
      /\b(pension\s+drawdown|drawdown\s+pension|annuity|pension\s+transfer)\b.{0,40}\b(advice|recommend|should|help\s+me)\b/i,
    ],
    referralKey: 'financial',
  },
  {
    domain: 'legal',
    label: 'Legal reserved activities',
    patterns: [
      // Conveyancing — only personal assistance requests, not general information queries
      /\b(help|assist|do|handle|manage|need)\b.{0,40}\bconveyancing\b/i,
      /\bmy\b.{0,20}\bconveyancing\b/i,
      /\bconveyancing\b.{0,40}\b(for\s+me|my\s+(house|flat|property|purchase|sale))\b/i,
      // Probate
      /\b(probate|grant\s+of\s+probate|letters\s+of\s+administration)\b/i,
      // Represent me in court / tribunal
      /\b(represent|representing)\s+(me|us)\b.{0,50}\b(court|tribunal|proceedings?|hearing|case|claim)\b/i,
      // Draft / write / prepare my will
      /\b(draft|write|prepare|create)\b.{0,20}\bmy\b.{0,20}\bwill\b/i,
      // "my will" + legal action
      /\bmy\s+will\b.{0,40}\b(draft|write|prepare|legal|advice|advise|update|change)\b/i,
      // Conduct litigation for me / my case
      /\bconduct\b.{0,30}\b(my\s+)?(litigation|case|claim|proceedings?)\b/i,
      // File/issue a claim on my behalf
      /\b(file|issue|lodge)\b.{0,30}\b(my|a|the)\b.{0,30}\b(claim|writ|injunction|proceedings?)\b.{0,30}\b(for\s+me|on\s+my\s+behalf)?\b/i,
      // Reserved instrument — "deed of trust", "transfer deed" for the user
      /\b(deed\s+of\s+trust|transfer\s+deed|legal\s+charge)\b.{0,40}\b(my|me|for\s+me)\b/i,
    ],
    referralKey: 'legal',
  },
  {
    domain: 'immigration',
    label: 'Immigration advice',
    patterns: [
      // "my visa" + any advisory context
      /\bmy\s+(visa|work\s+permit|tier\s+[0-9]|student\s+visa|spouse\s+visa)\b/i,
      // "visa application" in personal context
      /\b(my|i\s+am|i'm|for\s+me)\b.{0,40}\b(visa\s+application|immigration\s+(application|status|case))\b/i,
      /\bvisa\s+application\b.{0,40}\b(my|me|i\s+am|i'm|advice|advise|help)\b/i,
      // Right to remain / leave to remain
      /\b(right\s+to\s+remain|leave\s+to\s+remain|indefinite\s+leave|ilr|right\s+to\s+reside)\b/i,
      // Asylum claim or application
      /\basylum\b.{0,60}\b(claim|application|advice|help|apply)\b/i,
      // Deportation
      /\bdeportation\b.{0,40}\b(me|my|advice|prevent|fight|appeal|stop)\b/i,
      // "immigration advice for me / my situation"
      /\bimmigration\s+advice\b.{0,40}\b(my|me|for\s+me|my\s+situation|my\s+case)\b/i,
      // "advise me on my immigration"
      /\badvise\s+(me|us)\b.{0,50}\bimmigration\b/i,
      // Specific visa advice requests
      /\bhow\s+(do\s+i|can\s+i|should\s+i)\b.{0,60}\b(visa|immigration|right\s+to\s+remain|asylum)\b/i,
    ],
    referralKey: 'immigration',
  },
];

// ---------------------------------------------------------------------------
// Warm referral content keyed by referralKey
// Art. 11.1.3: signposting must not terminate the relationship;
// response must be additive — acknowledge, explain, signpost, keep door open.
// ---------------------------------------------------------------------------

const WARM_REFERRALS = {
  financial: {
    subject: 'About your goal — a note on financial advice',
    plainText: (greeting) => `${greeting}

Thank you for getting in touch with eskp.in.

Having read your message, it looks like you're asking for personalised financial or pension advice — for example, a recommendation about where to invest your money or how to manage your pension.

We're not able to help with this specific type of request. Under UK law, providing personalised investment or pension recommendations is a regulated activity that requires authorisation from the Financial Conduct Authority. Connecting you with someone who isn't authorised could cause you serious financial harm, so we don't do it.

Here's where to get proper help:

• MoneyHelper (free, government-backed): 0800 138 7777 | moneyhelper.org.uk
• Pension Wise (free pension guidance for over-50s): 0800 138 3944 | pensionwise.gov.uk
• Find an FCA-authorised adviser: register.fca.org.uk

If you have other goals — career advice, starting a business, navigating a life change — we'd be glad to help with those. Just reply to this email with something new.

— The eskp.in team`,
    htmlBody: (greeting) => `
      <p>${greeting}</p>
      <p>Thank you for getting in touch with eskp.in.</p>
      <p>Having read your message, it looks like you're asking for <strong>personalised financial or pension advice</strong> — for example, a recommendation about where to invest your money or how to manage your pension.</p>
      <p>We're not able to help with this specific type of request. Under UK law, providing personalised investment or pension recommendations is a regulated activity that requires authorisation from the Financial Conduct Authority. Connecting you with someone who isn't authorised could cause you serious financial harm, so we don't do it.</p>
      <p><strong>Here's where to get proper help:</strong></p>
      <ul style="margin:8px 0 16px 20px;padding:0;">
        <li style="margin-bottom:10px;"><strong>MoneyHelper</strong> (free, government-backed): <a href="https://www.moneyhelper.org.uk" style="color:#C4622D;">moneyhelper.org.uk</a> | 0800 138 7777</li>
        <li style="margin-bottom:10px;"><strong>Pension Wise</strong> (free pension guidance for over-50s): <a href="https://www.pensionwise.gov.uk" style="color:#C4622D;">pensionwise.gov.uk</a> | 0800 138 3944</li>
        <li style="margin-bottom:10px;"><strong>Find an FCA-authorised adviser:</strong> <a href="https://register.fca.org.uk" style="color:#C4622D;">register.fca.org.uk</a></li>
      </ul>
      <p style="color:#5A5450;">If you have other goals — career advice, starting a business, navigating a life change — we'd be glad to help with those. Just reply to this email with something new.</p>`,
    preheader: 'A note about financial advice — and where to get the right help',
  },
  legal: {
    subject: 'About your goal — a note on legal advice',
    plainText: (greeting) => `${greeting}

Thank you for getting in touch with eskp.in.

Having read your message, it looks like you're asking for help with a legal matter that involves what the law calls "reserved activities" — things like conveyancing, probate, drafting a will, or conducting litigation. These are areas that can only be carried out by qualified legal professionals.

We're not able to help with this specific type of request. Connecting you with someone without the proper legal qualifications could cause you real harm — financially and legally — so we don't do it.

Here's where to get proper help:

• Law Society Find a Solicitor (free search): solicitors.lawsociety.org.uk
• Citizens Advice (free legal information and referrals): 0800 144 8848 | citizensadvice.org.uk
• Law Centres (free legal help for those who qualify): lawcentres.org.uk
• Civil Legal Advice (legal aid): 0345 345 4 345

If you have other goals — things that don't involve formal legal proceedings or document drafting — we'd be glad to help. Just reply with something new.

— The eskp.in team`,
    htmlBody: (greeting) => `
      <p>${greeting}</p>
      <p>Thank you for getting in touch with eskp.in.</p>
      <p>Having read your message, it looks like you're asking for help with a legal matter that involves what the law calls <strong>"reserved activities"</strong> — things like conveyancing, probate, drafting a will, or conducting litigation. These are areas that can only be carried out by qualified legal professionals.</p>
      <p>We're not able to help with this specific type of request. Connecting you with someone without the proper legal qualifications could cause you real harm — financially and legally — so we don't do it.</p>
      <p><strong>Here's where to get proper help:</strong></p>
      <ul style="margin:8px 0 16px 20px;padding:0;">
        <li style="margin-bottom:10px;"><strong>Law Society Find a Solicitor</strong> (free search): <a href="https://solicitors.lawsociety.org.uk" style="color:#C4622D;">solicitors.lawsociety.org.uk</a></li>
        <li style="margin-bottom:10px;"><strong>Citizens Advice</strong> (free legal information): <a href="https://www.citizensadvice.org.uk" style="color:#C4622D;">citizensadvice.org.uk</a> | 0800 144 8848</li>
        <li style="margin-bottom:10px;"><strong>Law Centres</strong> (free help for those who qualify): <a href="https://www.lawcentres.org.uk" style="color:#C4622D;">lawcentres.org.uk</a></li>
        <li style="margin-bottom:10px;"><strong>Civil Legal Advice</strong> (legal aid): 0345 345 4 345</li>
      </ul>
      <p style="color:#5A5450;">If you have other goals — things that don't involve formal legal proceedings or document drafting — we'd be glad to help. Just reply with something new.</p>`,
    preheader: 'A note about legal advice — and where to get the right help',
  },
  immigration: {
    subject: 'About your goal — a note on immigration advice',
    plainText: (greeting) => `${greeting}

Thank you for getting in touch with eskp.in.

Having read your message, it looks like you're asking for advice about your specific immigration situation — your visa, your status, or an application you're making.

We're not able to help with this type of request. Under UK law, providing immigration advice to a named individual requires registration with the Office of the Immigration Services Commissioner (OISC) or authorisation as a solicitor. Unregulated immigration advice causes serious harm and is a criminal offence. We won't risk that.

Here's where to get proper help:

• Find an OISC-registered adviser (free search): gov.uk/find-an-immigration-adviser
• Refugee Council (asylum and refugee support): 0808 812 1010
• Coram Children's Legal Centre (young people and families): 01206 714 660
• Citizens Advice (general guidance and referrals): citizensadvice.org.uk

If you have other goals — things not related to your personal immigration situation — we'd be glad to help. Just reply with something new.

— The eskp.in team`,
    htmlBody: (greeting) => `
      <p>${greeting}</p>
      <p>Thank you for getting in touch with eskp.in.</p>
      <p>Having read your message, it looks like you're asking for advice about your <strong>specific immigration situation</strong> — your visa, your status, or an application you're making.</p>
      <p>We're not able to help with this type of request. Under UK law, providing immigration advice to a named individual requires registration with the Office of the Immigration Services Commissioner (OISC) or authorisation as a solicitor. Unregulated immigration advice causes serious harm and is a criminal offence. We won't risk that.</p>
      <p><strong>Here's where to get proper help:</strong></p>
      <ul style="margin:8px 0 16px 20px;padding:0;">
        <li style="margin-bottom:10px;"><strong>Find an OISC-registered adviser</strong> (free search): <a href="https://www.gov.uk/find-an-immigration-adviser" style="color:#C4622D;">gov.uk/find-an-immigration-adviser</a></li>
        <li style="margin-bottom:10px;"><strong>Refugee Council</strong>: <a href="https://www.refugeecouncil.org.uk" style="color:#C4622D;">refugeecouncil.org.uk</a> | 0808 812 1010</li>
        <li style="margin-bottom:10px;"><strong>Coram Children's Legal Centre</strong>: 01206 714 660</li>
        <li style="margin-bottom:10px;"><strong>Citizens Advice</strong>: <a href="https://www.citizensadvice.org.uk" style="color:#C4622D;">citizensadvice.org.uk</a></li>
      </ul>
      <p style="color:#5A5450;">If you have other goals — things not related to your personal immigration situation — we'd be glad to help. Just reply with something new.</p>`,
    preheader: 'A note about immigration advice — and where to get the right help',
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether goalText triggers a hard exclusion.
 *
 * @param {string} goalText - The raw goal text from the user's email.
 * @returns {{ triggered: boolean, domain?: string, label?: string, referralKey?: string }}
 */
function detectHardExclusion(goalText) {
  if (!goalText || typeof goalText !== 'string') {
    return { triggered: false };
  }

  for (const detector of DETECTORS) {
    for (const pattern of detector.patterns) {
      if (pattern.test(goalText)) {
        return {
          triggered: true,
          domain: detector.domain,
          label: detector.label,
          referralKey: detector.referralKey,
        };
      }
    }
  }

  return { triggered: false };
}

/**
 * Send a warm referral email and log it.
 * Called when detectHardExclusion returns triggered: true.
 *
 * @param {string} userEmail
 * @param {string|null} userName
 * @param {string} referralKey - 'financial' | 'legal' | 'immigration'
 */
async function sendWarmReferral(userEmail, userName, referralKey) {
  const referral = WARM_REFERRALS[referralKey];
  if (!referral) throw new Error(`Unknown referral key: ${referralKey}`);

  const greeting = `Hi${userName ? ` ${userName}` : ''},`;

  await send({
    to: userEmail,
    subject: referral.subject,
    text: referral.plainText(greeting),
    html: renderEmail({
      preheader: referral.preheader,
      body: referral.htmlBody(greeting),
    }),
  });

  // Log the outbound email
  await pool.query(
    `INSERT INTO emails (direction, from_address, to_address, subject)
     VALUES ('outbound', $1, $2, $3)`,
    [FROM, userEmail, referral.subject]
  );
}

module.exports = { detectHardExclusion, sendWarmReferral };
