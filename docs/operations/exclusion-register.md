# Operational Exclusion Register

**Status:** Live operational document
**Constitutional basis:** CONSTITUTION.md Article 11.1.1
**Research source:** `docs/research/professional-boundaries-and-directory.md` (Sections 1, 2, 3.3)
**Version:** 1.0
**Created:** 2026-03-08
**Next scheduled review:** 2027-03-08
**Owner:** Claude instance (escalate material changes to panel@eskp.in)

---

## Preamble

This document is the living exclusion register required by Article 11.1.1 of the constitution. It distinguishes between:

- **Hard exclusion** — domains where facilitating peer advice creates legal liability or serious harm risk; routing and matching logic must not route these goals to peer advisers
- **Sensitive handling** — domains where peer advice may proceed but must be supplemented by professional signposting and the witnessed reflection mode; the advisory relationship is maintained, not terminated

**Confidence caveat:** The financial advice and legal advice boundaries in Section 1 are high confidence (based on primary legislation). The medical, psychological therapy, and immigration entries are medium-high confidence. The tax, property, and data protection entries are medium confidence — based on absence of specific regulatory prohibition rather than clear safe-harbour provisions. A qualified UK solicitor should review the financial and legal advice entries before they are used to make live platform decisions with material consequences.

This register operates under Article 11.1.4: it must be updated when relevant UK law changes, including outcomes of the FCA's Advice Guidance Boundary Review, OSA secondary legislation, and changes to professional title regulation. Material changes to hard exclusion classifications require panel notification. Changes to sensitive handling protocols are within the Claude instance's autonomous authority.

---

## Section 1: Regulated Domain Register

Ten domains carrying UK regulatory obligations. The platform's email routing and goal matching logic must implement the protocols in this register.

| Domain | Classification | Legal Boundary (summary) | Regulator | Recommended Protocol | Primary Signposting | Last Reviewed |
|---|---|---|---|---|---|---|
| **Financial Advice (Investments)** | Hard exclusion | Personal recommendation on specified investments for a named individual (RAO 2001, Art 53; FSMA 2000 s.23 — criminal offence, up to 2 years) | FCA | Do not route to peer adviser. Signpost MoneyHelper. Panel members may share general information and personal experience; may not make personalised investment recommendations. | MoneyHelper: 0800 138 7777, moneyhelper.org.uk | 2026-03-08 |
| **Financial Advice (Pensions)** | Hard exclusion | Recommending a specific pension product, transfer, or drawdown strategy to a named individual (RAO 2001, Arts 52B, 53; same FSMA 2000 criminal penalty) | FCA | As above. Signpost Pension Wise (government guidance service, not regulated advice). | Pension Wise: pensionwise.gov.uk, 0800 138 3944; MoneyHelper | 2026-03-08 |
| **Financial Advice (Insurance)** | Hard exclusion | Advising on and arranging insurance contracts for a named individual (RAO 2001, Arts 21, 53; Insurance Distribution Directive retained UK law) | FCA | As above. Panel members may discuss their own experience with insurance products. | MoneyHelper; FCA register: register.fca.org.uk | 2026-03-08 |
| **Legal Advice (Reserved Activities)** | Hard exclusion for reserved acts; sensitive handling for general legal guidance | Six reserved activities under LSA 2007: rights of audience, conduct of litigation, reserved instrument activities (conveyancing, deeds), probate, notarial activities, administration of oaths. Criminal offence under LSA 2007 s.14 (up to 2 years). General legal information is not reserved. | SRA, Bar Standards Board, CLC, CILEX | Hard exclusion for: drafting legal documents, advising on litigation strategy in live proceedings, representing a user with a third party. Sensitive handling for general legal information and experience-sharing. Panel members who are solicitors may share general knowledge; may not provide client legal advice through the platform. | Law Society Find a Solicitor: solicitors.lawsociety.org.uk; Citizens Advice: 0800 144 8848; Law Centres: lawcentres.org.uk | 2026-03-08 |
| **Immigration Advice** | Hard exclusion | Advice relating to a specific individual's immigration status or application (IAA 1999 s.82). Criminal offence under IAA 1999 s.91 (up to 2 years). Ghost adviser harm extensively documented. | OISC/IAA, SRA, BSB | Do not route to peer adviser for specific individual immigration situations. Panel members may share their own immigration experience. Trigger terms: specific visa category advice, asylum applications, right to remain, immigration correspondence. | IAA adviser finder: gov.uk/find-an-immigration-adviser; Refugee Council: 0808 812 1010; Coram Children's Legal Centre: 01206 714 660 | 2026-03-08 |
| **Medical/Health Advice** | Sensitive handling (with specific hard exclusion triggers) | No criminal prohibition on giving health advice per se, but common law negligence applies (*Hedley Byrne*). Protected title "registered medical practitioner" (MA 1983). | GMC, HCPC | Sensitive handling for general health information. Hard exclusion for: (a) specific diagnostic conclusions about the user's condition; (b) advice to start, stop, or change prescription medication; (c) advice to avoid or delay seeking emergency care. | NHS 111: 111.nhs.uk; GP registration: nhs.uk | 2026-03-08 |
| **Psychological Therapy / Counselling** | Sensitive handling (with hard exclusion triggers) | "Practitioner psychologist" subdivisions are HCPC-protected titles. "Counsellor" and "psychotherapist" are NOT statutorily protected in the UK — significant grey zone. Common law negligence applies if advice causes harm. | HCPC (for protected psychology titles); PSA (voluntary register accreditation) | Sensitive handling: panel members may offer emotional support, witnessing, and peer companionship. Hard exclusion for: directing specific therapeutic techniques (EMDR, CBT exercises, exposure therapy) without professional qualification; advising on psychiatric medication. Platform's witnessed reflection mode is the primary mitigation in this domain. | BACP therapist finder: bacp.co.uk/search/therapists; NHS Talking Therapies: nhs.uk/mental-health/talking-therapies; Mind: 0300 123 3393 | 2026-03-08 |
| **Tax Advice** | Sensitive handling | Tax advice is not a regulated activity. No statutory criminal prohibition. CIOT/ATT are voluntary professional bodies. Common law negligence applies if incorrect advice causes financial loss. | CIOT/ATT (voluntary), HMRC (tax agent registration) | Sensitive handling. Panel members with professional tax knowledge may share general guidance. Should not hold themselves out as providing professional tax advice. Hard exclusion for: advice to make false tax return entries or structure transactions to breach tax rules. | HMRC: gov.uk/contact-hmrc; TaxAid: taxaid.org.uk; LITRG: litrg.org.uk | 2026-03-08 |
| **Property / Surveying Advice** | Sensitive handling (with hard exclusion trigger) | RICS regulates the "chartered surveyor" title. Giving property advice informally is not a regulated activity. Negligence liability for de facto survey opinions relied upon in transactions. | RICS (professional title), Trading Standards (estate agency) | Sensitive handling. General property guidance (what to look for at a viewing, homebuying process) is appropriate peer guidance. Hard exclusion for: panel members purporting to provide a structural survey opinion through the platform. | RICS Find a Surveyor: ricsfirms.com; Shelter: 0808 800 4444 | 2026-03-08 |
| **Data Protection Advice** | No exclusion | Giving data protection advice is not a regulated activity. ICO enforces against controllers and processors, not advisers. Common law negligence may apply if incorrect advice causes loss. | ICO (enforcement of controllers/processors only) | No hard exclusion. General GDPR information sharing is appropriate peer guidance. Panel members should not hold themselves out as providing formal legal data protection advice. | ICO: ico.org.uk, 0303 123 1113 | 2026-03-08 |

---

## Section 2: High-Risk Adjacency Register

Nine domains not (or not entirely) legally regulated but carrying meaningful risk of harm from poor informal advice. Protocol references the witnessed reflection distinction throughout.

| Domain | Classification | Harm Type | Platform Protocol | Primary Signposting | Last Reviewed |
|---|---|---|---|---|---|
| **Mental health / emotional crisis** | Sensitive handling with mandatory crisis protocol trigger | Iatrogenic worsening of suicidal ideation; advice to stop psychiatric medication; advice to avoid emergency care. Documented harm in peer forum contexts (Gould et al., 2002). | Hard exclusion: advising to stop psychiatric medication; advising against emergency care. Mandatory immediate signposting for: disclosure of suicidal ideation, self-harm, active crisis. Panel member "flag for support" function available. | Samaritans: 116 123; Shout: text SHOUT to 85258; NHS 111; Mind: 0300 123 3393; CALM: 0800 58 58 58 | 2026-03-08 |
| **Grief and bereavement** | Sensitive handling | Directive advice imposing timelines or pathologising normal grief; advice to suppress grief or avoid professional support | Witness grief, do not advise on it. Witnessed reflection mode is appropriate. Signpost proactively. | Cruse Bereavement Care: 0808 808 1677; Winston's Wish (child bereavement): 08088 020 021 | 2026-03-08 |
| **Relationship breakdown / divorce** | Mixed: legal dimension = hard exclusion; emotional dimension = sensitive handling | Directive legal advice on divorce without expertise; advice mischaracterising legal entitlements around children and finances; advice escalating conflict | Hard exclusion for: advice on financial settlements, child arrangement orders, or predicting court outcomes. Sensitive handling for: emotional support, navigating the process, witnessed reflection. Signpost to mediation and legal aid. | Family Mediation Council: familymediationcouncil.org.uk; Resolution: resolution.org.uk; Civil Legal Advice (legal aid): 0345 345 4 345 | 2026-03-08 |
| **Addiction recovery** | Sensitive handling with hard exclusion for medication/treatment advice | Advice undermining evidence-based treatment; pressure to stop clinical programmes; alcohol withdrawal unsupervised is medically dangerous | Panel members with lived recovery experience are valuable peer supporters. Hard exclusion: advising to stop alcohol dependency treatment without medical supervision (withdrawal risk). Sensitive handling for all other addiction support. | FRANK: 0300 123 6600; We Are With You: wearewithyou.org.uk; NHS drug and alcohol services via NHS.uk | 2026-03-08 |
| **Domestic abuse / coercive control** | Sensitive handling with mandatory signposting trigger | Couples counselling framing of coercive control; advice to return to abuser; failure to recognise coercive control; advice increasing safety risk | Mandatory immediate signposting on any domestic abuse or coercive control disclosure. Panel members: listen, validate, do not advise on whether to leave or stay — this requires specialist safety assessment. Hard exclusion for mediation framing in contexts involving disclosed abuse. | National Domestic Abuse Helpline (Refuge): 0808 2000 247 (24/7); Men's Advice Line: 0808 801 0327; Galop (LGBTQ+): 0800 999 5428 | 2026-03-08 |
| **Child welfare / safeguarding** | Sensitive handling with mandatory escalation design | Normalising abuse; advising not to report safeguarding concerns; inadvertently identifying a child at risk | Dyadic privacy means the platform cannot monitor for safeguarding signals — protocol must be built into user experience, not content moderation. Panel members should not advise on whether to report a specific concern — that decision should be supported by specialist services. Platform safeguarding disclosure in terms and onboarding (see `docs/backlog/phase-1/safeguarding-disclosure-terms.md`). | NSPCC: 0808 800 5000; ChildLine: 0800 1111; local children's social care via local council | 2026-03-08 |
| **Informal dietary / supplement / alternative health** | Sensitive handling with hard exclusion trigger | Dangerous supplement interactions (e.g., St John's Wort with SSRIs/contraceptives); advice to delay evidence-based treatment; restrictive dietary advice in eating disorder contexts | Sensitive handling: panel members may share personal dietary experience and signpost to evidence-based resources. Hard exclusion: advice to stop prescribed medication in favour of dietary/supplement intervention; advice to someone in active eating disorder recovery. | NHS: nhs.uk; BDA: bda.uk.com; BEAT (eating disorders): 0808 801 0677 | 2026-03-08 |
| **Employment disputes** | Sensitive handling with hard exclusion for settlement agreements | Incorrect advice on legal entitlements; advice accelerating disputes; settlement agreement advice without legal qualification | Sensitive handling for general employment information and experience-sharing. Hard exclusion: advising to sign or not sign a settlement agreement without qualified legal advice (statutory requirement — ESA 2010 s.147: the agreement is only valid if the employee has received advice from a qualified adviser). | ACAS: 0300 123 1100, acas.org.uk; Citizens Advice: citizensadvice.org.uk | 2026-03-08 |
| **Financial distress / debt** | Sensitive handling | Incorrect advice on insolvency options; advice to take on further debt to service existing debt; mischaracterising creditor rights | Sensitive handling. Panel members may share their own debt experience. Should not advise on specific insolvency instruments (IVAs, Debt Relief Orders) without flagging specialist services — these are complex legal/financial instruments. | StepChange: 0800 138 1111; National Debtline: 0808 808 4000; MoneyHelper: moneyhelper.org.uk | 2026-03-08 |

---

## Section 3: UK Signposting Library

Curated services by domain. Source: `docs/research/professional-boundaries-and-directory.md` Section 3.3. Used by the `safety-resources-page` (`/support`) and panel member onboarding.

**Mental Health Crisis:**
- Samaritans: 116 123 (24/7, free from any phone), jo@samaritans.org
- Shout Crisis Text Service: text SHOUT to 85258 (24/7, free)
- NHS 111: 111 (urgent mental health support, 24/7)
- Mind: 0300 123 3393, info@mind.org.uk
- CALM: 0800 58 58 58 (5pm–midnight)

**Suicide Prevention:**
- Samaritans (above)
- Papyrus HopelineUK (under 35): 0800 068 4141, text 07860 039 967

**Domestic Abuse:**
- National Domestic Abuse Helpline (Refuge): 0808 2000 247 (24/7, free)
- Refuge live chat: refuge.org.uk
- Men's Advice Line: 0808 801 0327
- Galop (LGBTQ+ abuse): 0800 999 5428

**Child Safeguarding:**
- NSPCC: 0808 800 5000 (adults concerned about a child)
- ChildLine: 0800 1111 (children and young people)
- Local children's social care via local council

**Legal Advice:**
- Law Society Find a Solicitor: solicitors.lawsociety.org.uk
- Citizens Advice: 0800 144 8848, citizensadvice.org.uk
- Law Centres: lawcentres.org.uk (free legal help)
- Civil Legal Advice (legal aid): 0345 345 4 345

**Immigration:**
- Immigration Advice Authority (OISC) adviser finder: gov.uk/find-an-immigration-adviser
- Refugee Council: 0808 812 1010
- Coram Children's Legal Centre (child immigration): 01206 714 660

**Financial:**
- MoneyHelper: 0800 138 7777, moneyhelper.org.uk
- StepChange (debt): 0800 138 1111, stepchange.org
- National Debtline: 0808 808 4000, nationaldebtline.org
- Pension Wise: pensionwise.gov.uk, 0800 138 3944
- Citizens Advice (financial): citizensadvice.org.uk

**Mental Health / Therapy:**
- NHS Talking Therapies (self-referral): nhs.uk/mental-health/talking-therapies
- BACP therapist finder: bacp.co.uk/search/therapists
- Mind: mind.org.uk

**Eating Disorders:**
- BEAT: 0808 801 0677 (adult), 0808 801 0711 (young people), beateatingdisorders.org.uk

**Addiction:**
- FRANK: 0300 123 6600, talktofrank.com
- We Are With You: wearewithyou.org.uk
- NHS drug and alcohol services via NHS.uk

**Housing:**
- Shelter: 0808 800 4444, shelter.org.uk
- Citizens Advice: citizensadvice.org.uk

**Employment:**
- ACAS: 0300 123 1100, acas.org.uk
- Citizens Advice: citizensadvice.org.uk

**Bereavement:**
- Cruse Bereavement Care: 0808 808 1677, cruse.org.uk
- Winston's Wish (child bereavement): 08088 020 021

**Property:**
- RICS Find a Surveyor: ricsfirms.com
- Shelter (housing rights): shelter.org.uk, 0808 800 4444

**Tax:**
- HMRC: gov.uk/contact-hmrc
- TaxAid (lower-income users): taxaid.org.uk
- LITRG (Low Incomes Tax Reform Group): litrg.org.uk

---

## Section 4: FCA Financial Promotions Constraint

**Status:** Operational guidance — not constitutional. Moved from draft Article 11.3.5 at Sunil's direction (2026-03-08). Requires specific legal advice before any action; do not treat this section as a legal opinion.

**The constraint:** Before launching any directory feature covering financial services professionals, the platform must obtain specific legal advice on whether the directory constitutes a "financial promotion" under FSMA 2000 s.21.

**The risk:** A financial promotion is any communication that "invites or induces" a person to enter into a controlled investment activity, or to acquire a controlled investment. A directory that enables users to be introduced to FCA-authorised advisers — even one where the introduction is mediated by network vouching — may constitute a financial promotion if the directory's purpose is to facilitate a commercial relationship between the user and the adviser.

**Possible exemptions that may apply:**
- *Generic promotions* (Financial Promotions Order 2005, Art. 17): communications that do not identify a specific investment or investment service may be exempt. A directory listing that describes a professional's areas of expertise without recommending them for a specific transaction may fall within this exemption.
- *Mere conduit* argument: the platform does not originate the financial promotion, it merely provides an infrastructure through which professionals are discoverable. This argument is untested for a vouching-based directory model.

**Neither exemption is settled** for a relational vouching directory. Neither provides a safe harbour without legal advice confirming applicability.

**Action trigger:** Escalate to panel (panel@eskp.in) before any public-facing directory feature goes live that includes financial services professionals. This is a legal advice requirement, not an operational decision.

---

## Section 5: Review Schedule

### Annual review
- **Due:** 2027-03-08
- **Owner:** Claude instance
- **Scope:** Full review of all 10 regulated domains and 9 adjacency domains against current UK law. Specific checks:
  - FCA Advice Guidance Boundary Review: progress and any enacted changes
  - OSA secondary legislation: any Ofcom codes of practice enacted or amended
  - LSA 2007: any changes to reserved legal activities
  - IAA/OISC: any regulatory changes to immigration advice authorisation
  - HCPC: any additions to or removals from protected psychology titles
  - CIOT/ATT: any change in government approach to voluntary vs statutory regulation of tax advice
- **Output:** Updated version of this document with revised entries, updated confidence ratings, and new "Last Reviewed" dates in the register tables

### Out-of-cycle update triggers (Article 11.1.4)
Any of the following triggers an immediate register update:
- FCA Advice Guidance Boundary Review outcomes published or enacted
- OSA secondary legislation enacted or materially amended
- Changes to reserved legal activities under LSA 2007
- Changes to immigration advice regulation (IAA 1999 amendments)
- Any OISC/IAA enforcement report indicating new ghost adviser harm patterns relevant to platform design
- Any platform incident involving a regulated domain (escalate to panel immediately; update register within 14 days)
- New UK Supreme Court or Court of Appeal decision materially affecting the *Hedley Byrne* duty of care analysis for informal advice

### Escalation path
- Changes to **hard exclusion classifications**: notify panel@eskp.in before updating; panel must acknowledge
- Changes to **sensitive handling protocols**: Claude instance autonomous authority; document in git commit message
- Changes to **signposting library** (contact details, service availability): Claude instance autonomous authority; update immediately when a service changes
