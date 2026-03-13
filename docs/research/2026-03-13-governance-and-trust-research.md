# Governance & Trust: Research Brief

**Date:** 2026-03-13
**Platform:** eskp.in
**Scope:** Panel governance (Phase 2), trust directory (Phase 3), governance & measurement (Phase 3), cross-cutting themes
**Prior research:** advisory-panel-structures-v2.md, professional-boundaries-and-directory.md, 2026-03-10-trust-signals-early-stage.md

---

## Methodology and Confidence Ratings

This document extends three prior research documents with targeted investigation of 15 specific questions across four domains. Web research was conducted across academic databases (PubMed/PMC, arXiv, SSRN), regulatory sources (FCA, SRA, GMC, HCPC, OISC, EU AI Act, NIST), practitioner literature, and platform case studies. Confidence ratings follow the project standard: 90–100% well-established, 70–89% generally reliable, 50–69% moderate uncertainty, below 50% speculative.

Where evidence is strong and replicable, findings are stated directly. Where evidence rests on single studies, indirect analogues, or contested findings, this is flagged. The document identifies several areas where the research question itself is novel — no close precedent exists — and says so rather than forcing a conclusion.

---

## Part 1: Panel Governance (Phase 2)

### 1.1 Multi-Advisor Models with Strict Information Isolation

**Research question:** Precedents for systems where multiple advisors serve one person but cannot see each other's interactions. Failure modes when advisors cannot coordinate.

**Confidence: 75%** — Healthcare fragmentation evidence is strong; direct precedent for bilateral thread isolation in digital advisory platforms is absent.

**Precedents identified:**

Healthcare multidisciplinary teams (MDTs) are the closest analogue, though they typically move *toward* information sharing rather than away from it. In MDTs, roles operate in parallel with relatively formal information exchanges through rounds and electronic health records. However, the literature consistently documents that compartmentalised records produce diagnostic delays, contradictory treatment plans, and missed holistic patterns. Systematic reviews describe coordination failures as "data failures in disguise" — when patient data is fragmented across systems, each provider works from a partial view.

Legal privilege structures offer a different model. Attorney-client privilege operates as bilateral confidentiality, but when multiple lawyers represent the same client, the "common interest privilege" allows communication between separate legal teams without waiving privilege. The key distinction: legal privilege isolates information *from adversaries*, not from co-advisors. eskp.in's model isolates information *between* co-advisors, which is architecturally novel.

UK IAPT (Improving Access to Psychological Therapies) stepped care uses tiered service delivery where different practitioners at different levels maintain separate records. Evidence shows this creates "fragmentation" and "insulation" in provision, with heterogeneous implementation across NHS trusts. The model has been criticised for insufficient coordination across steps.

**No digital platform precedent was found** that implements bilateral thread isolation between multiple advisors serving the same user. This appears to be architecturally novel.

**Failure modes under strict isolation:**

The healthcare fragmentation literature identifies five primary failure modes:

1. **Contradictory advice** — advisors operating from partial views may give incompatible guidance. Without a coordination mechanism, the user bears the full cognitive load of reconciling conflicting recommendations.

2. **Missed holistic patterns** — individual threads may each appear healthy while the aggregate picture reveals distress, escalation, or crisis. No single advisor can detect patterns that emerge only across threads.

3. **Crisis gaps** — if a user discloses risk in one thread but not others, the isolated advisor may not have sufficient context to assess severity. Other advisors remain unaware.

4. **Duplication of effort** — advisors may independently explore the same ground, wasting user and advisor time.

5. **User fatigue from repetition** — users must re-explain context to each advisor, which can be exhausting and may discourage engagement with the panel model altogether.

**Implication for eskp.in:** The isolation model is constitutionally committed (Art. 10.1.1, 10.1.3) and architecturally enforced. The research suggests this will produce real costs. The flag-for-support mechanism (Section 1.4) and warm support nudges partially mitigate crisis gaps but do not address contradictory advice or missed holistic patterns. The platform should be explicit with users about these limitations: "Your advisors cannot see each other's conversations. You may receive different perspectives — that is by design, but it means you will sometimes need to reconcile advice yourself."

**Reflexive note:** The healthcare evidence may overstate the problem. MDTs deal with clinical decisions where contradictory advice carries physical risk. In goal-pursuit advisory, contradictory advice may sometimes be beneficial — multiple perspectives without forced convergence could support autonomous decision-making. The literature does not test this hypothesis.

---

### 1.2 Crisis Training for Peer/Lay Supporters: Minimum Viable Module

**Research question:** What is the minimum training duration that shifts actual behaviour in crisis recognition and referral?

**Confidence: 65%** — Evidence for knowledge/attitude change is strong; evidence for actual behaviour change from brief training is weaker.

**Mental Health First Aid (MHFA):**

Meta-analyses show MHFA increases knowledge, decreases negative attitudes, and increases supportive behaviours post-training. Effects are small-to-moderate immediately post-training and up to 6 months later. Beyond 12 months, effects are unclear.

Critical gap: systematic reviews find "mixed effects on trainees actually using first aid skills in practice" and "no effect on helpfulness of actions or recipient mental health outcomes." MHFA shifts what people *know* and *feel* but the evidence that it shifts what people *do* when faced with a real crisis is weak.

**Samaritans listener training:**

The Samaritans model provides a more robust precedent for eskp.in's purposes. Selection takes a minimum of half a day (three volunteers conduct in-depth interviews). All listeners complete Listeners' Initial Training (LIT), grounded in Carl Rogers' person-centred approach. Core competencies: ability to listen, put personal feelings aside, non-judgmental and non-prescriptive stance. Samaritans explicitly do not claim to treat psychological problems — they listen, alleviate distress, and help people find their own solutions.

**Brief crisis recognition training (2–4 hours):**

The Crisis Awareness and Communication in Peer Support (CACPS) programme, used in Washington State, contains 7 modules of 20–30 minutes each (approximately 2–3.5 hours total). It covers crisis intervention, communication skills, self-care, and suicide assessment. However, specific behaviour change metrics are not extensively documented in public materials.

**UK safeguarding requirements:**

Volunteers in peer support roles require Level 1 safeguarding awareness training, with refresh every 2–3 years minimum. Mental health peer support workers additionally require training in information governance, fire safety, and receive mandatory supervision. The NSPCC offers a safeguarding training package specifically for the voluntary and community sector.

**Synthesis for eskp.in's minimum viable training module:**

The evidence suggests a 3–4 hour module covering: (a) crisis recognition markers, (b) warm referral protocol (not treatment, not advice — just referral), (c) the witnessed reflection principle (Section 1.3), (d) UK Level 1 safeguarding awareness, and (e) boundaries of the advisor role. This aligns with CACPS duration and content, Samaritans' non-prescriptive philosophy, and UK safeguarding requirements.

However, the honest assessment is that brief training reliably changes knowledge and attitudes but may not reliably change behaviour. The platform should therefore design its systems to make the *correct* behaviour (flagging, referring, not overreaching) the *easiest* behaviour — through UI affordances, not just training.

---

### 1.3 Witnessed Reflection vs Directive Advice

**Research question:** Evidence base for non-directive approaches vs directive advice in peer support; training non-professionals in reflective practice.

**Confidence: 80%** — Strong evidence from healthcare and peer support contexts. The distinction between clinical and peer settings is important.

**Core evidence:**

A study on peer support in diabetes management found that non-directive support was associated with higher physical activity, greater fruit/vegetable intake, lower alcohol use, and lower depressive/anxiety symptoms. Directive support in peer contexts showed no effect or detrimental effects on health behaviours.

In clinical therapy for acute depression, directive treatment was superior for immediate symptom reduction. The mechanism differs: non-directive support preserves patient agency and facilitates long-term behaviour change, while directive approaches work faster for acute crises but produce less sustained change.

This aligns with Schön's reflective practitioner framework: expertise in ill-structured domains is "knowing-in-practice" — tied to action, developed through reflection, and resistant to decontextualisation. The platform's advisory context (goal pursuit, capability development, navigating transitions) maps closely to ill-structured domains where reflective approaches outperform directive ones.

**Training non-professionals in reflective listening:**

A key experimental finding: non-professional students used reflective listening equally well after different training durations — extended training did not improve non-professional competency. The core techniques (mirroring and paraphrasing) are learnable quickly. Initial practice feels stilted and unnatural; comfort develops through practice rather than instruction.

Motivational Interviewing (MI) and peer support are distinct approaches. Researchers provide "no empirical justification for combining peer support and MI." MI is clinician-led; peer support is collaborative. The overlap in techniques (empathy, supporting self-efficacy) can create confusion, but the stance is fundamentally different.

**Implication for eskp.in:** The witnessed reflection principle is well-supported for the platform's use case (non-acute, goal-pursuit advisory). Training should focus on basic reflective listening (mirroring, paraphrasing) with explicit instruction that the advisor role is *not* to direct, diagnose, or prescribe. The training module need not be long — the evidence suggests brief instruction followed by practice is more effective than extended training for non-professionals.

---

### 1.4 Flag-for-Support Without Surveillance Dynamic

**Research question:** Precedents for concern-flagging that doesn't create a surveillance feeling; user perception of behind-the-scenes safety mechanisms.

**Confidence: 60%** — Conceptual framework is clear; empirical evidence for the specific design challenge is limited.

**Precedents:**

The EU Digital Services Act formalises "trusted flagger" mechanisms allowing NGOs and government bodies to submit content concerns with priority review. The flagger notifies the platform; the platform decides action independently; full content is not necessarily shared with all stakeholders. This separates *signalling concern* from *revealing content*, which maps to eskp.in's flag-for-support design.

**Surveillance vs safety framing:**

Research on self-harm monitoring in educational contexts documents that deploying monitoring as "safety" creates privacy and equity implications that may outweigh uncertain benefits. The critical insight: "surveillance isn't safety" — monitoring and support are distinct functions, and conflating them erodes trust.

User perception research shows gendered differences in safety perception on platforms, and a "privacy paradox" where users with high privacy concerns still engage fully but adjust settings rather than reducing use. Users generally accept safety mechanisms when framed as protection rather than surveillance, but what feels transparent to some may feel like surveillance to others — particularly in sensitive domains requiring discretion.

**Design implications for eskp.in:**

The flag-for-support mechanism (Art. 10.1.1) — where an advisor signals concern to the platform without sharing content, and the user receives a warm support nudge with no reference to the flag — is well-designed in principle. Key risks:

1. **Pattern detection** — if users consistently receive support nudges after disclosing certain topics to certain advisors, they may infer the mechanism exists and feel surveilled even though content is not shared.

2. **False positive burden** — over-flagging could generate frequent nudges that feel intrusive, while under-flagging defeats the purpose.

3. **Transparency paradox** — disclosing the mechanism's existence could either build trust ("your advisors can signal concern without seeing each other's threads") or create anxiety ("my advisor might be flagging me").

The research does not resolve this paradox. The platform should consider user-testing both approaches: full disclosure of the mechanism vs. discovery-on-use, and measuring which produces greater trust and willingness to engage.

---

## Part 2: Trust Directory (Phase 3)

### 2.1 Vouch-Based Trust Systems

**Research question:** Precedents, scaling behaviour, tendency to reproduce social inequalities.

**Confidence: 80%** — Strong academic evidence on network inequality; limited precedent for private directed vouches specifically.

**Superlinear trust accumulation:**

Network science research on preferential attachment demonstrates mathematically that in networks where well-connected nodes attract disproportionately more new links, a dominant vertex emerges that accumulates connections of order *n* while all other vertices remain bounded. Applied to vouch networks: professionals who receive early vouches will accumulate more vouches faster, creating a trust inequality that compounds over time.

**Homophily and class reproduction:**

Research consistently shows that status homophily — people's tendency to associate with others of similar social status — drives network stratification. When vouch-based trust couples with homophily, people from well-connected social groups receive more vouches due to existing connections, creating a reinforcing cycle. Academic evidence from employment networks shows that "when reliance on referrals couples with homophily, groups with higher employment receive more referrals due to homophily, leading to higher chances of employment."

**LinkedIn endorsements as a vouch system:**

LinkedIn endorsements show meaningful algorithmic weight (profiles with skill endorsements see up to 43% higher content distribution), but the system suffers from reciprocity gaming and hollow endorsements. Recruiters report endorsements feel "lazy" rather than representing genuine expertise backing. The lesson: vouch systems must resist mechanical reciprocity.

**Professional referral networks:**

In healthcare referral networks, concentrated referrals encourage repeat interactions that improve team-specific knowledge, coordination, and trust. The greater the expectation of future interactions, the more powerful the incentives to sustain trust. This supports eskp.in's model where vouches carry relationship context — the relationship itself is the trust signal, not the count.

**Implication for eskp.in:** The vouch model (Art. 11.3.2) will reproduce existing social inequalities unless deliberately counteracted. Private directed vouches with relationship context are more resistant to gaming than public counts, but they do not solve the preferential attachment problem. The platform must monitor vouch distribution and implement structural mitigations (Section 2.2).

---

### 2.2 Two-Tier Access: Solvable or Only Monitorable?

**Research question:** Structural mitigations for relational trust models advantaging well-connected users.

**Confidence: 55%** — The problem is well-documented; proven solutions at platform scale are not.

**Assessment:** Two-tier access is **mitigable but not fully solvable** within relational trust models. The inequality is an inherent property of preferential attachment in networks, not a bug to be fixed.

**Structural mitigations identified:**

1. **Trust bootstrapping for new users** — Onboarding design that provides a baseline trust signal independent of existing connections. Possibilities: institutional trust signals (credential verification gives a floor), platform introduction ("this professional was verified by eskp.in on [date]"), or a probationary profile period where new professionals receive visibility equivalent to established ones.

2. **Mutual aid fairness principles** — Mathematical fairness models from mutual aid networks show that every participant can be treated equally in sharing costs commensurate with risk. Applied to a trust directory: the platform could ensure minimum visibility for all verified professionals regardless of vouch count.

3. **Anti-homophily interventions** — Proactive introduction of diversity in recommendations. If the platform detects that vouch networks are clustering by geography, profession, or social background, it can inject cross-cluster visibility.

4. **Monitoring as constitutional obligation** — The platform's commitment to two-tier monitoring (Art. 11.3.4) is itself a structural mitigation — making inequality visible and treating it as a constitutional issue rather than an operational metric creates accountability.

**No platform precedent was found** that has demonstrably solved this problem. Cooperative platforms (Stocksy, Up&Go) use democratic governance to address power imbalances but operate in different trust domains. The honest answer is that eskp.in is attempting something architecturally novel, and the monitoring obligation may be more important than any specific mitigation — it creates the feedback loop needed to detect and respond to emerging inequality.

---

### 2.3 Credential Verification Across UK Professional Registers

**Research question:** Operational burden of manual verification across 5+ UK registers. Available APIs or bulk lookup tools.

**Confidence: 85%** — Register availability and access methods are well-documented from official sources.

**Register-by-register assessment:**

| Register | Online Search | API | Bulk Lookup | Estimated Time per Verification |
|---|---|---|---|---|
| FCA Financial Services Register | Yes (firm name or FRN) | Yes. 50 requests/10 seconds rate limit. No SLA. Authentication required; pricing may apply for premium tiers. | Via API | 2–5 minutes |
| SRA Solicitors Register | Yes (name or registration number) | Yes, free JSON API. Daily updates. Firm-level only — individual solicitors require manual web lookup. | Firm-level via API | 5–10 minutes (individual) |
| GMC Medical Register | Yes (name or reference number) | Endpoint exists but documentation requires direct contact. Bulk download: £815/year + VAT. | Yes (bulk download licence) | 2–5 minutes (online), faster with bulk data |
| HCPC Register | Yes (profession + surname) | Yes, Employer Check API for batch verification. | Yes (up to 100 at once) | 2–5 minutes |
| OISC/IAA Immigration Adviser Register | Yes (name or reference number). Rebranded as Immigration Advice Authority Jan 2025. | Not found | Not found | 5–10 minutes |

**No unified aggregator service** exists for UK professional register checks across all sectors. Authorised Corporate Service Providers (ACSPs) aggregate some Companies House and anti-money laundering checks but do not cover professional registers.

**Cost estimate:** Healthcare credentialing literature suggests manual verification costs £200–£600 per provider including document gathering, verification, follow-up, and resubmission. For eskp.in's simpler check (confirming active registration against a public register), the cost is substantially lower — estimated 5–15 minutes per professional at launch, scalable through API integration for FCA, SRA (firm-level), and HCPC.

**Recommendation:** At launch, manual verification against online registers is feasible for small numbers (under 50 professionals). As the directory scales, API integration for FCA and HCPC is straightforward; SRA requires supplementing the firm-level API with individual web lookups; GMC bulk download may be cost-effective above approximately 100 verifications per year; OISC/IAA remains manual. The platform should track verification time per register to inform build-vs-buy decisions for Phase 3.

---

### 2.4 Directory Discoverability Without Public Ratings

**Research question:** How new users find professionals in a privacy-first model.

**Confidence: 70%** — Precedents exist in professional directories; user acceptance evidence for advisory contexts is limited.

**Precedents:**

The Law Society's Find a Solicitor directory operates without user reviews. Discovery works through two-tier search: quick search (legal issue + location) and advanced search (name, SRA ID, practice areas). Quality signals are institutional rather than crowd-sourced — the Lexcel quality mark (a voluntary accreditation for legal practice management) serves as a proxy for quality. Users filter by accreditation status, specialty, and location rather than rating.

Professional directory UX patterns use attribute-based, faceted search with filters for specialties, certifications, locations, and availability. Boolean operators, synonym management, and natural language processing guide users to relevant results without rating-based sorting.

**User acceptance:**

In medicine, 65% of patients report using review sites, but users also navigate directories by direct referral, word-of-mouth, and institutional affiliation. HIPAA and professional confidentiality rules limit physicians' ability to respond to public reviews, creating friction that some professionals and patients prefer to avoid.

**Implication for eskp.in:** The directory should invest heavily in filter and categorisation UX. Discovery without ratings requires richer metadata: specialty areas, geographic focus, credential type, verification date, and relationship context from vouches (without revealing vouch identity or count). The Law Society model — institutional quality marks plus faceted search — is the closest working precedent. New users without existing connections will need an alternative discovery path (see Section 2.2 on trust bootstrapping).

---

## Part 3: Governance & Measurement (Phase 3)

### 3.1 Self-Efficacy Measurement Without Invasive Tracking

**Research question:** Validated, low-friction instruments for domain-specific self-efficacy measurement.

**Confidence: 90%** — Well-established psychometric instruments exist across multiple validation studies.

**Validated instruments:**

| Instrument | Items | Reliability | Validation | Suitability |
|---|---|---|---|---|
| General Self-Efficacy Scale (GSE, Schwarzer) | 10 | α = 0.86–0.95 | 25+ countries, 19,120 participants | Gold standard but may be too long for routine use |
| New General Self-Efficacy Scale (NGSE, Chen et al. 2001) | 8 | α = 0.86–0.90, test-retest r = 0.65–0.66 | Strong content validity (88% items classified as genuine GSE) | Good balance of brevity and validity |
| GSE-6 (short form) | 6 | α = 0.79–0.88 | Selected for highest discrimination | Good for longitudinal designs |
| GSE-3 (ultra-short form) | 3 | Scalar measurement invariance across UK and Germany | Excellent quality criteria met | Ideal for digital platforms with measurement burden concerns |

Domain-specific scales exist for financial self-efficacy (6 items, α = 0.76), career decision self-efficacy (25-item short form), and health self-efficacy. These may be more relevant than general scales for eskp.in's domain-specific goals.

**Behavioural proxies:**

Self-efficacy can be inferred from behavioural patterns without explicit measurement: goal completion rate, re-engagement patterns (returning to set new goals after completing one), decreasing support-seeking frequency (fewer clarification requests over time), and creation of implementation intentions (if-then planning). Research shows that self-efficacy directly predicts initiation and sustained effort toward goal achievement.

**Minimising measurement burden:**

Survey research consistently shows that each additional survey burden increases probability of skipped questions by 10–64%. Strategies: switching from Likert scales to binary questions delivers more reliable differentiation; limiting to 3 most important outcomes plus 1–2 open-ended questions; using branching logic to avoid redundancy; and spacing measurements strategically rather than after every interaction.

**Recommendation for eskp.in:** GSE-3 (3 items) administered quarterly, supplemented by passive behavioural proxy tracking (goal completion, re-engagement, support-seeking trajectory) provides the minimum viable measurement system. For domain-specific measurement, adapt 3–4 items from the relevant domain scale (financial, career, health) based on the user's goal category. Total measurement burden: under 60 seconds per quarter.

---

### 3.2 Algorithm Audit Methodology for Small-Scale LLM-Based Systems

**Research question:** Realistic audit methodology and bias vectors for decomposition and matching.

**Confidence: 75%** — Frameworks exist; proportionate approaches for small organisations are documented but not extensively tested.

**Frameworks:**

The EU AI Act requires risk-based classification with proportionate governance. NIST AI RMF 1.0 provides a voluntary four-function framework (Govern, Map, Measure, Manage) with a specific Generative AI Profile (NIST.AI.600-1) for LLM risks. Both are designed to be proportionate — small organisations adapt guidance to context rather than implementing enterprise-scale audit infrastructure.

**Bias vectors in goal decomposition:**

1. **Language bias** — Western-centric defaults: LLMs trained on English-dominant internet data embed Western cultural assumptions even when processing non-Western contexts. Goal decomposition may unconsciously impose Western frameworks for success, career progression, or problem-solving.

2. **Cultural assumptions** — Moral framework homogenisation: systems may fail to represent diverse cultural moral frameworks despite linguistic capability. A goal like "improve my family situation" could be decomposed through individualistic assumptions that don't fit collectivist cultural contexts.

3. **Domain knowledge gaps** — Underrepresented domains show lower quality decomposition. Goals in niche professional domains, minority-language communities, or uncommon life situations may receive shallower or more generic decomposition.

**Bias vectors in AI matching:**

1. **Demographic proxy bias** — Matching systems using similar-user associations may rely on associations that correlate with ethnicity, gender, socioeconomic status, or geographic proxies.

2. **Availability heuristics** — If certain helper profiles are returned more frequently, they accumulate positive feedback, reinforcing their prominence (analogous to the preferential attachment problem in vouching).

3. **Tag-overlap oversimplification** — The current tag-overlap fallback in matching (src/services/match.js) may systematically favour helpers with broad, generic tags over specialists whose expertise is narrowly described.

**Proportionate audit approach for Phase 1:**

A realistic audit programme for eskp.in at current scale:

1. **Quarterly correspondence test** — Submit 50–100 synthetic goals with varied demographic contexts (name, location, cultural framing) through decomposition and matching. Compare outputs for systematic differences.

2. **Outcome equity tracking** — Track match acceptance rates, resolution rates, and re-engagement patterns by available user cohort variables. Flag statistical divergences for investigation.

3. **Annual transparency report** — Publish audit methodology, findings (including null and negative findings), and mitigations implemented.

4. **Decomposition review** — Manually review a sample of decomposition outputs each quarter for cultural assumptions, language bias, and domain knowledge gaps.

This is lighter than enterprise audit but heavier than no audit. The correspondence test is the most valuable single intervention — it directly tests whether the system treats different users differently.

---

### 3.3 User Advisory Councils with Binding Input

**Research question:** Precedents for genuine (not performative) user governance with binding authority.

**Confidence: 80%** — Strong precedents from platform cooperatives; conditions for genuine influence are well-documented.

**Precedents:**

**Stocksy United** (cooperatively-owned stock photography platform) provides the strongest precedent. Members shape policy via online discussion forums. Resolution process: member submits proposal → membership votes on whether to address (quorum required) → 7-day voting period → democratic debate between membership and leadership → board approval forwards to resolution committee → final member vote → approved resolutions become business roadmap commitments. One member, one vote.

**Up&Go** (worker-owned cleaning cooperative) uses democratic decision-making with workers receiving 95% of job fees. Binding input from worker-owners on pricing, working conditions, and service standards.

**NHS patient advisory boards** are advisory only — recommendations go to NHS leadership but are not binding. The gap between "influence" and "binding" is substantial in healthcare governance. Patient Safety Commissioner Advisory Groups provide formal recommendations but final decisions remain with governance structures.

**Conditions for genuine (vs performative) governance:**

Research identifies clear markers:

Genuine: concrete action over messaging, sustained involvement over time, deep one-on-one relationships between decision-makers and community members, evidence-based input, alignment of words and actions, clear purpose and accountability mechanisms.

Performative: public expression of support without genuine commitment, shallow gestures focused on gaining attention, symbolic participation without resource allocation, no mechanism for holding the organisation accountable to recommendations.

**30-day public response commitment:**

No specific 30-day precedent was found. UK government consultation best practice aims for 12-week response publication. US federal rulemaking uses 60-day comment periods with 30-day reply windows. eskp.in's 30-day commitment (Art. 10.2.4) is more ambitious than standard practice, which may build credibility precisely because it exceeds norms.

**Implication for eskp.in:** The User Advisory Council design should model Stocksy's resolution process: proposal → quorum → debate → vote → binding implementation on scoped decisions. Binding authority should cover specific domains (changes to decomposition taxonomy, matching fairness thresholds, pricing changes, data policy changes) while operational decisions remain with platform governance. The 30-day response commitment is unusual and should be prominently communicated as a differentiator.

---

### 3.4 Publishing Unflattering Empirical Results

**Research question:** Organisational models for mandatory publication of negative results; whether publishing negative results builds or destroys trust.

**Confidence: 85%** — Strong evidence from clinical trial transparency; the GiveWell case study is instructive for the gap between aspiration and practice.

**Regulatory precedent:**

The Declaration of Helsinki (2013) creates an explicit duty: researchers "have a duty to make publicly available the results of their research" including "negative and inconclusive as well as positive results." The WHO Joint Statement on public disclosure of clinical trial results specifies a 12-month publication timeline, though this timeframe is not in the Declaration of Helsinki text itself. The FDA Amendments Act requires clinical trial results registration. Clinical trial registries create standing obligation — once registered, non-publication is a visible breach.

**GiveWell transparency model:**

GiveWell publishes a dedicated page documenting organisational mistakes and lessons learned. However, since 2016, GiveWell reviewed evidence for a large number of programmes but "the vast majority of this work remained private" in internal documents never published. GiveWell acknowledged this as a "substantial failure to be transparent" — they deprioritised preparing work for publication in favour of assessing more opportunities. Charity evaluators also do not systematically include unintended negative consequences of endorsed activities in benefit calculations.

The lesson: even organisations with strong transparency commitments drift toward non-publication when publication competes with other priorities. The obligation must be structurally enforced, not just culturally valued.

**Impact on trust:**

Nonprofits that are more transparent and share publicly (audited financials, goals, strategies, metrics) received 53% more in contributions. Stories paired with credible data create persuasive evidence of impact. Data deficiency creates trust gaps — when organisations fail to track and report outcomes, they lose the evidence supporters need.

Publishing negative results specifically: null results prevent duplicate effort, evaluate reproducibility, and identify approaches not worth pursuing. Publication bias skews knowledge toward positive results, distorting the evidence base. Honest reporting of failures signals rigorous testing rather than concealment.

**Governance enforcement mechanisms:**

Most mechanisms are legislative or regulatory. Private sector voluntary adoption typically requires: public commitment documented in charter/governance documents, board-level accountability, and reputational risk if obligations are breached. No universal private sector enforcement mechanism exists without legal structure. The CIC asset lock model is instructive — mission protection works because it is statutory, not voluntary.

**Recommendation for eskp.in:** The constitutional obligation to publish results including weak results (Art. 10.4) should be operationalised as: (a) pre-registration of key hypotheses and metrics before each measurement cycle, (b) publication of all results within 30 days of completion, (c) panel review of evaluation results with escalation if negative findings are suppressed, (d) a public archive of all evaluation results in the repository. The GiveWell lesson is critical: the commitment must be structured so that *not* publishing requires more effort than publishing, not the reverse.

---

## Part 4: Cross-Cutting Themes

### 4.1 Privacy–Efficacy Tension

**Confidence: 75%** — The tension is well-documented; resolution models exist in healthcare but not in peer advisory platforms.

Thread isolation and no content access protect users but limit quality measurement, problem detection, and advisor coordination. The Donabedian model (structure, process, outcome) from healthcare provides the framework for measuring quality without content access:

- **Structure measures**: Helper credentials, training completion, availability, response time
- **Process measures**: Follow-up frequency, referral appropriateness, flag-for-support usage patterns
- **Outcome measures**: User-reported outcomes (self-efficacy scales), goal completion, re-engagement

Routine Outcome Monitoring (ROM) from mental health services — where therapists administer brief standardised outcome measures to clients at regular intervals — maps directly to eskp.in's constraints. ROM is blind to session content but tracks wellbeing improvements.

The platform cannot measure *quality of advice* directly under thread isolation. It can measure *quality of outcomes*. The gap between these is the irreducible cost of the privacy commitment. The research suggests this is a defensible tradeoff — outcome measurement is at least as predictive of service quality as process measurement in therapeutic settings, and privacy preservation may itself contribute to better outcomes by enabling more honest disclosure.

### 4.2 Relational vs Transactional Trust

**Confidence: 65%** — Academic frameworks exist; limited empirical evidence on outcomes when relational and transactional trust are directly compared for advisory services.

Zucker (1986) identified three forms of trust production: process-based (built on past exchanges), characteristic-based (built on social category membership), and institution-based (built on formal structures). The specific importance of each form is context-dependent — high uncertainty favours process-based trust, while low uncertainty favours characteristic-based.

Meta-analytic research on organisational relationships shows that calculative/transactional trust tends to operate in early phases (compensating for weak contracting), while relational trust emerges in mid-to-late stages. The research suggests both forms are needed: "we need a rich mixture of both relational and transactional trust."

For eskp.in's design: institutional trust (credential verification, platform governance) provides the floor. Relational trust (vouches with relationship context) provides the signal. The absence of transactional trust signals (ratings, reviews, rankings) is a deliberate choice, but it means the platform must invest more heavily in institutional and relational trust mechanisms to compensate.

**Evidence gap:** The specific claim that relational trust *outperforms* transactional trust for advisory services is not empirically tested. The research base is suggestive (referral networks produce better coordination and knowledge; rating systems suffer from gaming and legibility bias) but does not constitute proof. The platform should frame this as a hypothesis to be tested empirically, not a settled conclusion.

### 4.3 Constitutional Rigidity

**Confidence: 70%** — Frameworks for balancing mission protection and flexibility exist; longitudinal empirical evidence is limited.

**Mission-lock mechanisms in UK law:**

CIC asset locks are permanent and cannot be removed by members or directors — assets must transfer to other asset-locked bodies or charities on dissolution. However, the asset lock is "only as strong as the membership of the organisation" — participatory governance and community scrutiny strengthen effectiveness. An asset lock locks assets but cannot lock strategic direction; a CIC could still prioritise commercial income over social mission without breaching the lock.

B-Corp certification locks governance structure and stakeholder consideration through articles amendment, but does not lock assets. Shareholder exits and profit distribution remain permissible.

**The "dead hand" problem:**

Constitutional theory identifies the paradox that founders' commitments prevent future adaptation. The classic formulation (Thomas Jefferson): "the earth belongs in usufruct to the living." The counter-argument: humans must be able to make temporally extended commitments to be truly free — "we are part of a historical community with a web of rights and obligations arising from our nation's struggle to lay down temporally extended commitments and honour those commitments over time."

**Balancing rigidity and flexibility:**

Research on mission drift in social enterprises identifies that governance mechanisms provide safeguards but "there is still a danger of mission drift unless active steps are taken to manage the tensions that arise from trying to achieve both commercial and social goals." The recommended approach: use ownership structure to incorporate stakeholders, governance structure to ensure social mission supremacy, and keep operational priorities flexible.

Three resilience strategies identified: adaptability, diversification, and ecosystem building — with ecosystem building providing the most complex safety net.

**Implication for eskp.in:** The constitutional commitments (can't abolish council, can't add ratings, can't charge providers) trade adaptability for integrity. The research suggests this is defensible if: (a) the commitments protect *mission direction* rather than specific implementations, (b) operational flexibility is preserved within the constitutional frame, and (c) amendment processes exist (even if requiring supermajority or constitutional process) for genuinely unforeseen circumstances. The current CONSTITUTION.md should be reviewed to ensure it distinguishes between immutable principles and mutable implementations.

---

## Summary: Evidence Strength by Question

| # | Question | Confidence | Key Finding |
|---|---|---|---|
| 1.1 | Multi-advisor isolation precedents | 75% | No digital platform precedent. Healthcare fragmentation evidence documents 5 failure modes. |
| 1.2 | Crisis training minimum viable module | 65% | 3–4 hours shifts knowledge/attitudes; behaviour change evidence is weak. Design systems to make correct behaviour easiest. |
| 1.3 | Witnessed reflection vs directive advice | 80% | Non-directive peer support outperforms directive for sustained behaviour change. Brief training sufficient for non-professionals. |
| 1.4 | Flag-for-support without surveillance | 60% | Conceptually sound; empirically understudied. User-test both disclosure and non-disclosure framings. |
| 2.1 | Vouch-based trust systems | 80% | Superlinear accumulation is mathematically inevitable. Private directed vouches resist gaming but not inequality. |
| 2.2 | Two-tier access mitigation | 55% | Mitigable but not solvable. Monitoring obligation may be more important than any specific intervention. |
| 2.3 | Credential verification burden | 85% | APIs exist for FCA, SRA (firm), HCPC. Manual feasible under 50 professionals. No unified aggregator. |
| 2.4 | Directory discoverability without ratings | 70% | Law Society model works. Invest in filter UX, institutional quality marks, and trust bootstrapping. |
| 3.1 | Self-efficacy measurement | 90% | GSE-3 (3 items quarterly) + behavioural proxies is optimal. Under 60 seconds per quarter. |
| 3.2 | Algorithm audit methodology | 75% | Quarterly correspondence test + outcome equity tracking. Proportionate for Phase 1. |
| 3.3 | User advisory councils | 80% | Stocksy model provides precedent. Binding authority on scoped decisions. 30-day response exceeds norms. |
| 3.4 | Publishing negative results | 85% | Clinical trial model provides template. GiveWell shows aspiration-practice gap. Structure so not-publishing requires more effort. |
| 4.1 | Privacy–efficacy tension | 75% | Donabedian model + ROM from mental health. Outcome measurement replaces content access. |
| 4.2 | Relational vs transactional trust | 65% | Both needed; relational trust outperforming transactional is hypothesis, not proven for advisory. |
| 4.3 | Constitutional rigidity | 70% | Defensible if distinguishing mission direction from implementation. CIC asset lock is strongest UK mechanism. |

---

## Open Questions for Further Research

1. **Bilateral thread isolation in digital advisory** — eskp.in appears to be architecturally novel. Consider publishing the design rationale and inviting academic collaboration to study outcomes.

2. **Behaviour change from brief crisis training** — the evidence gap between attitude change and behaviour change in crisis recognition is real. Consider partnering with a UK university to study whether the platform's training module changes actual flagging and referral behaviour.

3. **Relational trust outcomes** — the platform's hypothesis that vouch-based relational trust outperforms review-based transactional trust for advisory services should be pre-registered as a testable claim with measurable outcomes.

4. **Two-tier access inequality** — the monitoring commitment (Art. 11.3.4) needs specific metrics. Define what "well-connected" means operationally, what "more/faster referrals" would look like in data, and what threshold triggers constitutional concern.

5. **Constitutional amendment process** — the current constitution may benefit from an explicit amendment process that protects immutable principles while allowing evolution of mutable implementations.

---

*Generated by: Research session — 2026-03-13*
