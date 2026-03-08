Now I have sufficient research to produce the full structured document. Let me compile it.

---

# eskp.in Platform Research Document: Stress-Testing the Council Advisory Thesis

## Preamble

This document presents findings across six research domains intended to stress-test, not validate, the core thesis of the eskp.in platform. Each section terminates in either a testable feature prototype specification or a failure mode analysis. Where evidence is weak, this is stated explicitly. Where Western research may not transfer to an Indian user base, this is flagged.

---

## Section 1: Self-Esteem Mechanism Model

### 1.1 The Core Problem

The platform's founding claim — that council/advisory structures produce self-esteem benefits — requires a specified mechanism. Without one, the platform cannot prioritise which interactions to build first, and cannot define success metrics.

The self-esteem literature itself carries a critical caveat: Baumeister et al. (2003), in a landmark review, found that self-esteem is more often the *result* of competent performance than its cause. The causal arrow is disputed. This means the platform cannot assume that making users feel good about themselves through advisory feedback will produce downstream improvement in goal achievement. The mechanism must route through something more proximate: *self-efficacy* (domain-specific belief in one's capacity to act) rather than global self-esteem.

**Confidence level in the causal self-esteem → performance claim: 25%.** The correlation is real; the direction is contested.

### 1.2 Bandura's Four Sources of Self-Efficacy

The most empirically grounded framework for the self-esteem/confidence mechanism is Bandura's social cognitive theory. Self-efficacy draws from four sources: mastery experiences, vicarious experiences, verbal persuasion, and physiological/affective states.

The theoretical ranking (mastery > vicarious > verbal > physiological) is widely cited but empirically contested. A 2025 dominance analysis study of physical activity self-efficacy (PMC12502103) found the actual empirical ranking as follows:

| Rank | Source | Variance Explained |
|------|--------|--------------------|
| 1 | Mastery Experience (prior success) | 18.4% |
| 2 | Verbal Self-Persuasion (internal talk) | 15.8% |
| 3 | Positive Affective States | 11.8% |
| 4 | Negative Affective States | 10.7% |
| 5 | Vicarious Experience (observing others) | 2.3% |
| 6 | Verbal Persuasion by Others | 1.0% |

The study's most surprising finding: verbal persuasion *by others* — the primary mechanism of an advisory platform — accounted for only 1% of explained variance. Vicarious experience showed a *negative* relationship when controlling for other sources.

**Critical implication:** If the platform's theory of change relies primarily on advisors telling users they can do things (verbal persuasion) or users watching their advisors succeed (vicarious experience), the empirical base for this is weak. The platform must be designed to generate *mastery experiences* — small, completed actions that build the user's sense of their own competence. The advisor's role is not to encourage but to help the user structure the conditions for self-generated success.

**Confidence in this implication: 70%.** The study is domain-specific (physical activity). Transfer to goal-pursuit broadly requires further evidence.

### 1.3 The Advisor Effect: Being Asked for Advice

Eskreis-Winkler et al. (PNAS, 2019) conducted a preregistered field experiment with 1,982 high school students. Students randomly assigned to *give* motivational advice to younger peers earned significantly higher report card grades than controls: +1.14 grade points in a target class (d = 0.12, p = 0.009) and +0.91 grade points in math (d = 0.10, p = 0.038). These effect sizes rank at the 50th-70th percentile of school interventions, achieved in 8 minutes of advice-giving activity.

The mechanism hypothesised: giving advice increases the giver's own confidence more than receiving advice does. Across four domains (financial, interpersonal, health, work), giving advice raised self-reported confidence and motivation more than receiving it (Eskreis-Winkler and Fishbach, 2018).

Separately, HBS research found that being asked for advice signals to the person being asked that they are perceived as competent — boosting the advisor's confidence — with this effect strongest when: (a) the task is difficult, (b) the advice-seeker approaches them specifically rather than "others in general," and (c) the advisor has relevant expertise.

**Platform implication:** The advisor's self-esteem benefit is not a side effect — it is a primary mechanism. The advisor role must be designed to make advisors feel like experts, not just helpers. This is the seldom-articulated double benefit of the council model.

**Confidence: 80%** for the giving-advice confidence boost. The PNAS study is well-powered and preregistered.

### 1.4 Witnessed Progress: The Doubled-Edged Evidence

Being witnessed in goal pursuit has a paradoxical effect documented in multiple studies. Reynolds et al. (2019) in a longitudinal field study of 132 weight-loss group participants found that observing others make good progress was associated with *stronger stated intentions* to lose weight, but *worse actual weight loss over the following week*. The mechanism is vicarious goal satiation: observing others progress activates a false sense of personal progress that reduces actual effort.

The CoSA (Circles of Support and Accountability) programme, which uses a 4-6 person inner circle model around a core member, reports different findings: volunteers experience enhanced self-esteem, feelings of social connectedness, and broader social networks. Core members show confidence increases and reduced dynamic risk scores.

**Resolution of the apparent contradiction:** Vicarious goal satiation occurs when progress observation is passive (watching others succeed at the same goal). The CoSA model works because the relationship is asymmetric and role-differentiated: the witness is not competing with the watched. When advisors and users have distinctly different roles and are not pursuing the same goal, vicarious satiation is less likely to occur.

**Platform implication:** Never place users pursuing identical goals in the same advisory group observing each other's progress. The panel members must have a *different structural role* from the user — they are witnesses and consultants, not co-competitors.

**Confidence: 65%.** The vicarious satiation literature is relatively recent and not yet replicated at scale.

### 1.5 Role Holding and Identity

Maton (1988) studied 15 self-help groups and found that groups with higher role differentiation, greater order and organisation, and leaders perceived as more capable had members who reported more positive well-being and group appraisal. The acquisition of a unique role promotes belonging by making oneself irreplaceable.

Research on volunteer role identity (van Ingen and Wilson, 2017; Thoits, 2012) shows that volunteers who internalise their advisory role as part of their identity report higher purpose and meaning — and are more likely to sustain engagement. Longitudinal studies confirm that role identity strengthens over time as a predictor of committed participation.

### 1.6 Mechanistic Model Summary

Listed by estimated effect strength (highest to lowest), with evidence quality rating:

| Interaction Type | Hypothesised Mechanism | Evidence Quality | Estimated Effect |
|-----------------|----------------------|-----------------|-----------------|
| Completing a small, structured task | Mastery experience → domain self-efficacy | Strong (Bandura, replicated) | Highest |
| Giving advice to someone else | Confidence boost from expert role signal | Strong (PNAS, preregistered, d=0.10-0.12) | High |
| Being asked specifically for advice | Competence signal from the seeking act | Moderate (HBS, lab studies) | Moderate-High |
| Sustained, consistent relational contact | Identity development, social approval from attached other | Moderate (youth mentoring meta-analysis, small effect) | Moderate |
| Verbal encouragement from advisors | Verbal persuasion source of self-efficacy | Weak (1% variance in physical activity domain) | Low unless advisor is credible expert |
| Observing similar others succeed | Vicarious experience | Weak-to-negative (satiation risk) | Low or negative |
| Holding a named role in a group | Role identity → belongingness, irreplaceability | Moderate (Maton 1988, Thoits 2012) | Moderate |

**Core design implication:** Build the platform's first features around generating mastery experiences (small completed actions) and formalising the advice-giving role for advisors. Do not lead with encouragement features or progress-sharing feeds.

---

## Section 2: Advisor Motivation Model

### 2.1 What Sustains Advisor Engagement

Research on volunteer motivation identifies two primary categories: functional (instrumental, career, learning) and relational (social connection, identity). Nencini et al. (2016) found that relational bonds between volunteers are the most important factor in retention — not mission alignment or task satisfaction alone.

The HOPEFUL model (Tandfonline, 2024) proposes: helping → self-efficacy + psychological well-being → sustained engagement. The key condition: the helper must perceive their help as *effective*. When advisors cannot see whether their input made a difference, engagement decays rapidly.

AA sponsorship research identifies two sustaining mechanisms: (1) the interpersonal benefit drawn from supporting others, and (2) the self-understanding gained from having to articulate and model the skills being taught. Sponsors who perceive their role as supporting their own recovery (not just helping the sponsee) sustain engagement far longer. The dual-benefit framing is protective against burnout.

### 2.2 Advisor Decay Curve: Identified Inflection Points

Based on peer mentoring longitudinal studies and volunteer retention research, a typical engagement curve looks as follows:

**Month 0-2 (Activation):** High enthusiasm, novelty effect, identity-building around new role. Dropout risk: low. Risk factors: unclear expectations, no early visible impact.

**Month 2-4 (Reality check):** First experience of the user making no progress despite advice. First experience of emotional labour without visible reward. Dropout risk: elevated. Risk factor: feeling ineffective, no feedback loop showing impact.

**Month 4-8 (Dependency risk or stable engagement):** Either the advisor has internalised the role identity and finds intrinsic reward, or has begun to feel burdened. For sponsors in AA, research notes the burden of multiple sponsees, additional childcare responsibilities, and emotional energy costs. Dropout risk: high for over-extended advisors. Risk factor: unclear role boundaries, user dependency formation, no exit mechanism.

**Month 8+ (Staleness):** Role identity either well-established (sustaining) or the advisor has plateaued. Research on volunteer retention shows that without periodic renewal — new challenges, recognition, or role evolution — engagement decays even in committed volunteers.

**Critical finding:** AA literature notes that the single most understudied area is advisors who *refuse to take on the role* or who *disengage silently* rather than formally exiting. The platform must design for this shadow population.

### 2.3 Three Feature Concepts for Motivation Sustainment (Without Gamification)

**Feature Concept A: The Echo Report**

Mechanism: Address the "effectiveness invisibility" problem — the primary cause of early advisor dropout. After each interaction cycle, the platform generates a structured summary for the advisor showing what the user did in response to their advice (not how the user felt about it — what they *did*). The advisor sees their advice translated into action.

Structural specification: User reports a specific action taken (or not taken) that traces to a specific advisor recommendation. Platform shows the advisor this trace. No scores, no leaderboards. Just: "Your advice about X led to Y trying Z."

Testability condition: A/B test advisor retention at 4-month mark between groups who receive Echo Reports vs. groups who do not. Success = statistically significant difference in advisor retention rate.

**Feature Concept B: Role Evolution Milestones**

Mechanism: Address the Month 8+ staleness problem. The advisor's role has a defined arc: Observer → Challenger → Elder. Each stage has different interaction permissions, different expected contributions, and different recognition formats. The role evolves so the identity-investment deepens rather than calcifies.

Structural specification: Observer stage (months 0-3): primarily asks questions, cannot give direct advice. Challenger stage (months 3-12): permitted to name patterns they observe across multiple cycles. Elder stage (12+ months): invited to contribute to the panel's shared protocols and governance.

Testability condition: Measure advisor engagement depth (number of meaningful interactions per month) and stated role satisfaction at 6-month and 12-month marks, comparing evolution-model cohorts to static-role cohorts.

**Feature Concept C: Dual-Benefit Framing**

Mechanism: Address the asymmetric motivation problem. Position the advisor role as explicitly beneficial to the advisor — not through gamification but through structured reflection. At onboarding and at quarterly intervals, advisors are asked: "What did you learn about yourself from advising X this quarter?" The platform makes the advisor's growth legible to themselves.

Structural specification: Quarterly reflection prompt, private to the advisor. Optional sharing with the user with permission. Optional anonymised contribution to platform's collective learning.

Testability condition: Measure advisor-reported sense of personal benefit from the role at quarterly intervals. Compare 12-month retention between advisors who complete quarterly reflections vs. those who skip them.

### 2.4 The Dark Patterns: When Advisory Becomes Harmful

Research on toxic mentoring (NIH, 2022; LinkedIn, advisory) identifies the following risks:

- **Mentor/advisor exploitation of mentee time and talent:** Using the mentee's situation to advance the advisor's learning at the mentee's cost.
- **Dependency formation:** Poor boundary-setting leads to mentee relying on advisor for decisions rather than developing their own capacity.
- **Advisor narcissism:** The advisory role attracted to people who enjoy the feeling of having answers. When a user stops needing advice, the narcissistic advisor may undermine progress to maintain relevance.
- **Information asymmetry weaponisation:** The advisor knows intimate details about the user's goals and fears. This information can be used coercively, consciously or not.

**Structural mitigation requirements:** Clear role charters defining what the advisor is and is not authorised to do; explicit time boundaries on engagement; regular check-ins where the user assesses whether they feel more autonomous or less autonomous than 3 months ago; an exit mechanism that does not require the user to justify themselves to the advisor.

---

## Section 3: Panel Structural Specification

### 3.1 Group Size

The research on optimal group size converges but is not conclusive:

- Group psychotherapy systematic review (2025): favours groups of fewer than 9 members; partial support for size effects on outcomes across 17 studies (N=21,425).
- Peer learning research: groups of 4 members emerge as optimal for learning improvement over smaller or larger groups.
- CoSA: 4-6 volunteers in an inner circle.
- YPO/EO forums: 6-10 members for peer advisory groups, monthly meetings.
- Group psychotherapy cohesion research: smaller groups generate more meaningful social interactions, more feedback per member, more individual time; risk of "pivoting toward individualised therapy" and disproportionate influence of certain individuals.

**Recommended panel size: 4-6 advisors.** This is the convergent recommendation across support groups, peer advisory structures, and the best-studied formal advisory model (CoSA).

**Confidence: 70%.** Group size research is still maturing. The 4-6 recommendation is consistent but based on limited direct evidence for non-therapeutic advisory contexts.

### 3.2 Role Types

Based on the Quaker Clearness Committee model, YPO Forum structure, CoSA, and role differentiation research:

**Recommended role differentiation within a 4-6 person panel:**

| Role | Function | Key Constraint |
|------|----------|---------------|
| Witness | Attends to the user's emotional state; reflects back what they observe, without advice | Cannot give direct recommendations |
| Challenger | Questions assumptions; surfaces blindspots; names patterns they observe | Must phrase as questions, not statements |
| Domain Expert | Holds relevant expertise to the user's goal domain | Limited to 1 per panel; overloading with experts creates consultation dynamics, not support |
| Timekeeper/Moderator | Holds the structure of interactions; ensures all voices are heard; manages cadence | Rotates every 3 months to prevent power concentration |
| Peer (optional) | A person at the same stage of a similar goal; provides solidarity not advice | Cannot be the same person as Domain Expert |

Note: The Quaker Clearness Committee's most powerful structural constraint is that committee members may *only ask questions* — they are explicitly forbidden from giving advice or sharing their own similar stories. This rule deserves serious consideration for the default mode of at least the Witness and Challenger roles.

**Confidence in role differentiation recommendation: 65%.** The Maton (1988) research is suggestive but old. CoSA evidence is domain-specific. Quaker model is not empirically studied but has 350 years of operational validation.

### 3.3 Interaction Cadence

CoSA meets weekly for the first year with a high-risk core member, then monthly. YPO forums meet monthly. AA sponsors are available "as needed" with a weekly touchpoint norm.

**Recommended cadence:**
- **Monthly structured session** (the council meeting): all panel members present, 90-120 minutes, structured format.
- **Weekly asynchronous check-in**: user posts a brief structured update (2-3 sentences: what I did, what I didn't do, what I'm sitting with). Advisors may respond or not. No obligation to respond each week.
- **On-demand direct contact** with a single designated advisor (the Challenger or Witness, not all panel members): prevents the fatigue of managing a group inbox.

**Confidence: 60%.** This is interpolated from adjacent models. The specific cadence for a non-crisis personal goal advisory context has not been directly studied.

### 3.4 Composition Principles

**Homophily vs. Diversity:**
Research on group composition shows mixed findings. Homophily facilitates initial trust formation and cooperation. Diversity improves cognitive task performance but can increase turnover. For a support/advisory group, the research on peer support groups suggests similarity on the core challenge (the user's goal domain) but diversity on perspective, demographic background, and experience level.

For an Indian user base, an additional dimension is relevant: caste, regional, and religious group membership. Research specifically on negative mentoring experiences in India identifies caste or religious mismatch as the most frequently reported negative experience (ERIC source, mentoring in Indian organisations). The platform cannot ignore this. Panel composition tools must be sensitive to this without reproducing hierarchy.

**Recommended composition rule:** Similarity on the goal domain (at least 2 of 4 panel members should have relevant experience); diversity on approach and life stage; explicit user consent over composition; no forced matching on caste, regional, or religious dimensions.

**Confidence in composition rules: 55%.** This is an area where primary research with Indian users is genuinely necessary before making firm platform decisions.

### 3.5 Structured vs. Unstructured Format

Research on group interventions (Oxford Academic, 2024) suggests that structured formats offer consistency and professional oversight, while unstructured formats generate richer personal connection. The YPO forum model and Quaker Clearness Committee both use highly structured interaction formats that paradoxically produce more personal and honest disclosure — the structure provides psychological safety.

**Recommendation:** Use a structured interaction protocol for monthly sessions (defined phases: check-in, update, focus question, reflection, close) with unstructured space in the weekly async check-in. The monthly session structure is the platform's primary interaction product.

---

## Section 4: Privacy Architecture

### 4.1 The Privacy Problem in Mediated Advisory Relationships

The user shares goals and struggles with a panel. The panel holds information that is potentially sensitive: financial difficulties, relationship conflicts, mental health context, professional insecurities. Two risk vectors exist: (1) advisor misuse of information, (2) context collapse — the wrong information reaching the wrong people outside the panel.

Vitak (2012) found that context collapse significantly reduces self-disclosure on platforms with undifferentiated audiences. Structured audience segmentation (Friend Lists, group-specific posts) partially mitigates this. Research on anonymity and self-disclosure (Anonymity and Online Self-Disclosure meta-analysis, 2019) found a positive but modest correlation between anonymity and disclosure (r = 0.184), with substantial variability across studies. Full anonymity is not required for disclosure; perceived anonymity and structural protection matter more than technical anonymity.

### 4.2 The Therapeutic Frame as Analogy

In clinical supervision, therapists share case information with supervisors using the following tiered model: (a) de-identified clinical material (the pattern, the challenge, the intervention) goes to supervisors; (b) identifying information is concealed unless legally required; (c) therapist's own emotional response to the case stays within personal reflection or therapy, not shared with the client.

This framework directly informs a three-tier platform privacy model.

### 4.3 Three-Tier Information Visibility Model

**Tier 1 — The User's Private Layer**

Definition: Information held only by the user and not shared with any advisor or the platform's AI layer by default.

Contents: The raw personal narrative behind the goal; the specific fears and self-assessments; historical context the user has not chosen to share; personal identifying details beyond what is necessary for goal support.

Design implication: The platform should never require users to share full personal narratives. The primary input to the advisory process should be *structured goal abstractions* — a goal decomposed into specific, actionable needs — not open autobiographical text. The user controls what gets abstracted and what stays raw.

**Tier 2 — The Panel Layer**

Definition: Information shared with the user's named advisors, subject to the panel confidentiality agreement.

Contents: Structured goal summaries; weekly check-in updates; explicit questions posed to the panel; action logs (what was tried, what worked, what didn't); emotional register (1-5 scale: how the user is feeling about progress) — not the underlying emotional content.

Design implication: The platform's data architecture should store the panel layer in a separate schema from Tier 1. If the user leaves the platform, the panel cannot access historical Tier 2 data beyond a specified retention window (e.g., 30 days). Advisors do not own the interaction history — the user does.

Panel confidentiality agreement: Required at onboarding for every advisor. Specifics: panel discussions cannot be shared outside the panel; advisors cannot contact the user outside the designated channels; advisors cannot discuss the user with other advisors outside the structured session.

**Tier 3 — The Platform/AI Layer**

Definition: Aggregated, de-identified pattern data used for platform improvement; AI-mediated summaries visible to advisors.

Contents: Anonymised goal category patterns; interaction quality metrics (not content); AI-generated summaries of user progress for advisor consumption (with user consent).

Design implication: This is where AI mediation must be handled with care.

### 4.4 AI Mediation Risk/Benefit Map

Research on AI-mediated communication (AI-MC) is cautionary. Recent studies (2023-2025) find:
- AI-MC reduces perceptions of authenticity, trust, responsibility, and competence.
- Communications written by AI on behalf of employees led to lower perceived integrity specifically.
- Perceived humanness and interactivity are the primary trust factors in AI-mediated systems.
- Disclosure of AI involvement matters: users who know AI was involved rate communications lower.

However, AI mediation offers specific structural benefits in an advisory context:

| AI Mediation Use Case | Benefit | Risk | Recommendation |
|----------------------|---------|------|----------------|
| Summarising user's weekly updates for advisors | Reduces advisor cognitive load; ensures busy advisors are up-to-date | May strip emotional nuance that advisors should see | Use only if user opts in; include raw update alongside summary |
| Structuring the user's goal decomposition | Converts vague goals into specific actionable needs; reduces user-advisor mismatch | Risk of AI imposing structure that doesn't fit the user's actual situation | AI suggests structure; user approves before it goes to advisors |
| Generating reflection prompts for advisors | Helps advisors ask better questions | Risk of homogenising advisory style; advisors defer to AI prompts rather than their own judgment | Present as suggestions, not scripts; advisors should not be able to see each other's prompts |
| Flagging when a user has gone silent | Addresses the shadow dropout problem | Could feel surveillance-like | Frame as user-benefit: opt-in "check in on me if I go quiet" |
| AI as an intermediate layer masking advisor identities | Protects advisor privacy; allows partial anonymity | Degrades relationship quality significantly if overused | Only appropriate for the first 1-2 interactions before a formal panel relationship is established |

**Overall AI mediation principle:** AI should be used to structure information and reduce friction, not to mediate the relational content of the advisory interaction itself. The moment AI is writing messages that appear to come from advisors, or interpreting emotional content on behalf of users, trust degrades. The platform's value proposition is human-to-human advisory. AI is the scaffolding, not the floor.

---

## Section 5: Failure Mode Register

| # | Failure Mode | Trigger Conditions | Early Warning Signals | Structural Mitigation |
|---|-------------|-------------------|----------------------|----------------------|
| 1 | **Vicarious Satiation** — user observes panel members succeed and substitutes the observation for their own effort | Goal similarity between user and at least one advisor; frequent progress sharing by advisors | User is highly engaged in sessions but action completion rates are declining; user reports "feeling inspired" but not acting | Role architecture strictly differentiates user from advisor: advisors are witnesses, not co-pursuers. Never display advisor's personal goal progress to user. |
| 2 | **Advisor Burnout/Silent Dropout** — advisor disengages without notification, leaving user with an inactive panel | Multiple concurrent advisory relationships; user's progress is slow or invisible to advisor; unclear what impact advisor is having | Advisor response latency increasing; qualitative change in message depth from substantive to generic; missed sessions | Echo Report feature (Section 2.3). Hard limit: advisors can hold no more than 3 active users simultaneously. Exit protocol: structured offboarding, not silent withdrawal. |
| 3 | **Performance Anxiety / Choking** — social observation produces anxiety rather than motivation | User has high trait anxiety or low baseline self-efficacy; stakes feel high; panel feels evaluative | User report shows declining wellbeing scores; user actions are getting more cautious (safer) over time; withdrawal from async check-ins | Design observation as *witnessing* not *evaluating*. Witnesses must follow the Quaker rule: no advice, only questions. Make explicit that the panel is there for the user, not assessing them. Optional "silent mode" — user can pause the panel's view of their progress for up to 2 weeks without explanation. |
| 4 | **Dependency Formation** — user stops developing autonomous judgment and outsources decisions to advisors | Long relationship duration without role evolution; user asks advisors for permission rather than input; advisor enjoys the dependency | User's language shifts from "I decided" to "my advisor said I should"; user expresses anxiety when advisors are unavailable | Quarterly autonomy audit: user self-assesses whether they feel more or less capable of independent judgment than 3 months ago. Flagged to platform if declining. Advisor charter explicitly forbids advisors from making decisions for users. |
| 5 | **Hierarchy Crystallisation (India-specific)** — panel member who is older, higher-caste, or professionally senior becomes de facto authority rather than equal advisor | Panel has significant status differential; Indian high power distance culture; user from lower social position than advisor | User defers to one panel member disproportionately; other panel members go quiet; user stops questioning recommendations | Rotating moderator role. Structured turn-taking protocol in monthly sessions. Panel composition tool includes power-distance sensitivity check. Training for advisors on the Indian-specific deference dynamic. |
| 6 | **Context Collapse / Privacy Breach** — information shared in the panel leaks outside | No formal confidentiality agreement; advisors know each other outside the platform; no technical data separation | User reports discomfort after advisor mentions the platform in a social context; user becomes increasingly vague in check-ins; user discloses less over time | Three-tier data architecture (Section 4). Mandatory confidentiality agreement at advisor onboarding. Technical: Tier 2 data not exportable, retained only within the active panel relationship window. |
| 7 | **Coercive Group Dynamics** — panel begins to function as a high-control structure, pressuring user toward group-approved goals | Homogeneous panel (all advisors share similar worldview); long duration with no external check; advisor group cohesion higher than user-panel cohesion | User's goals start to shift toward what the panel approves; user reports feeling guilty when they diverge from panel's framing; user cannot articulate their own goal without referencing the panel's view | Diversity requirement in panel composition. User-accessible "escape hatch": exit any panel without explanation, no cool-down period. Annual panel rotation protocol: no advisor stays on a panel for more than 18 months. |
| 8 | **Face-Saving Avoidance (India-specific)** — izzat (family/personal honour) dynamics prevent honest disclosure of setbacks | User from cultural background where failure disclosure carries shame risk; panel includes people from user's social network; stakes involve family or professional status | User check-ins become progressively more positive and formulaic; user discloses failure only when it's already resolved; metrics improve on reported actions but not on actual outcomes | Structural separation of social network from advisory panel (advisor cannot be a family member, close friend, or current colleague). Anonymous disclosure option for weekly check-ins. Explicit platform norm: setbacks are structural information, not personal failures. |
| 9 | **Advisor Narcissism / Expertise Hijacking** — advisor uses platform to perform expertise rather than serve the user's needs | Panel includes advisor with high domain status; user is deferential; no mechanism to check whether advice is being used | Advisor message volume significantly higher than others; user's questions become increasingly about validating the advisor's preferred approach; other advisors disengage | Role architecture limits each advisor to question-asking as default mode. Monthly session format gives equal airtime to each advisor. User satisfaction rating per advisor (private, not shown to advisors) to identify patterns. |
| 10 | **Goal Drift** — the user's stated goal diverges from their actual situation without the platform adapting | Long engagement with no goal revision mechanism; advisors optimised for original goal framing; user changed but is too embarrassed to invalidate the panel's investment | User actions are technically consistent with stated goal but user reports increasing dissatisfaction; check-ins feel formulaic; user starts mentioning new aspirations in passing | Quarterly goal review: structured moment where user can revise, fork, or close any goal without explanation. Goal revision treated as a success signal (clarity achieved), not a failure. Panel explicitly informed that goal revision is expected, not problematic. |

---

## Section 6: Case Study Extractions

### 6.1 Toastmasters

**What works:** Role rotation is the structural core of Toastmasters. Every session has a Toastmaster of the Day, a Grammarian, a Timer, an Ah-Counter, an Evaluator, a General Evaluator. No one is a permanent observer. Evaluation is one-third of meeting time. The evaluation protocol is highly structured: positive feedback first, specific suggestion second, positive close. Every member cycles through every role, which prevents status crystallisation and ensures everyone develops both performance and evaluation skills.

**What fails:** Toastmasters research on dissemination effectiveness (PubMed, 2014) finds that the structure can become ritualistic — clubs where the ritual is followed but genuine developmental challenge has atrophied. Long-term members often stop being evaluated rigorously because social norms protect them.

**One adaptable feature:** The *structured evaluation protocol* (positive → specific suggestion → positive close) applied to advisor feedback in monthly sessions. The structure prevents criticism from becoming discouraging while still enabling honest input. Particularly relevant for the Indian izzat dynamic: structured feedback protects both speaker and recipient.

### 6.2 Alcoholics Anonymous Sponsor Model

**What works:** The sponsor holds their own recovery as the primary motivation for engagement — they are not primarily a helper, they are a person protecting their own abstinence through service. This dual-benefit framing (serving others as self-care) is the most powerful protective factor against burnout documented in the AA literature. The sponsor-sponsee relationship is asymmetric but bounded: the sponsor does not solve problems for the sponsee, they share experience, strength, and hope. Availability is high (daily contact is the norm) but the content of interactions is defined.

**What fails:** AA sponsors are largely unsupported. Research notes that burnout from multiple concurrent sponsees is a significant but understudied problem. The burden falls disproportionately on experienced members who have not developed explicit boundaries. The platform equivalent is the advisor who becomes the go-to for every user's crisis.

**One adaptable feature:** The *sponsorship philosophy* framing at advisor onboarding: "Your role here is not to fix this person. You are sharing what you know. The sharing benefits you too. If it stops being useful to you, it is time to change the structure." This reframes the advisor's motivation as self-interest aligned with service — not self-sacrifice.

### 6.3 YPO/EO Forum Model

**What works:** YPO forum practices rest on three explicit foundations: trust, confidentiality, and shared learning. Monthly meetings use a structured 15-step agenda honed for CEO peer advisory. Confidentiality is non-negotiable and actively reinforced at every meeting by the moderator. The model explicitly acknowledges that advisors are also vulnerable — no participant is assumed to have all the answers. This peer-parity framing prevents the hierarchy crystallisation failure mode.

Notably: "Nothing of a confidential nature is sent before the meeting; at the end, written confidential information is collected and destroyed." This physical confidentiality ritual has a psychological function beyond security — it signals the seriousness of the confidentiality commitment to all participants.

**What fails:** YPO/EO forums are effectively unstudied empirically beyond self-reported member satisfaction. The claim that member companies grow 2.2x-5x faster is from Dun & Bradstreet studies funded by Vistage — selection bias is extreme. The academic literature on executive peer advisory groups concludes they are "seldom discussed in academic literature" with "few studies." Treat the effectiveness claims with significant scepticism.

**One adaptable feature:** The *confidentiality ritual* at each monthly session opening. The moderator verbally restates the confidentiality agreement at the start. This is a 30-second act that performs a critical function: it primes all participants to shift into a different relational register than everyday social interaction.

### 6.4 Circles of Support and Accountability (CoSA)

**What works:** CoSA uses a formal inner circle of 4-6 volunteers alongside an outer circle of professional supporters — a two-layer structure that separates relational support (inner circle) from professional oversight (outer circle). Core members show 71-83% recidivism reduction compared to matched controls. Volunteers report enhanced self-esteem and social connectedness — evidence that the advisor benefit model works in an asymmetric care context.

**What fails:** CoSA's evaluation research is methodologically variable. The 83% recidivism reduction claim comes from the highest-quality Canadian replication studies; other studies show smaller effects. The specific structural features that produce the outcome cannot be isolated from the population characteristics (high-risk, high-stakes context) and the volunteer motivation profile (community safety as the shared purpose).

**One adaptable feature:** The *inner/outer circle architecture*: a small, relational inner circle (the 4-6 advisor panel) with a defined outer circle of domain experts or professional contacts who can be brought in for specific questions without being ongoing members of the panel. This prevents the inner circle from over-expanding to accommodate every expertise need while still giving users access to specialist input.

### 6.5 Quaker Clearness Committee

**What works:** The clearness committee is the most structurally conservative of all the models reviewed — and arguably the most relevant to eskp.in's high-context advisory use case. The rules: the committee can only ask questions, never give advice. The focus person has Inner Teacher who knows what is needed. The committee's job is to help that knowledge surface, not to supply knowledge from outside. Meetings last 2-3 hours. Confidentiality is absolute.

This model explicitly rejects the most common failure mode of advisory structures: the advisor's need to demonstrate their wisdom crowding out the user's developing capacity for self-knowledge.

**What fails:** The clearness committee requires exceptional discipline from participants, especially the restraint from advice-giving. In practice, participants routinely drift into sharing their own experiences (explicitly prohibited by the protocol). Without ongoing training and norm reinforcement, the structure degrades. It also has no formal mechanism for repeated engagement — it is designed for a single discernment event, not ongoing support.

**One adaptable feature:** The *questions-only rule* as a default mode for all advisory panel interactions, with advice-giving as a named exception requiring the user to explicitly request it. This single structural choice addresses hierarchy crystallisation, advisor narcissism, and dependency formation simultaneously. It is also consistent with the Indian cultural context where the default relational mode in hierarchical advisory relationships is top-down pronouncement — the questions-only rule directly inverts this dynamic.

### 6.6 Focusmate

**What works:** Focusmate is the simplest case study here: 25-75 minute virtual co-working sessions with a single partner, brief goal statement at the start, brief report at the end. Motivation mechanism is social accountability via presence — the body double effect. Platform has grown substantially, particularly among ADHD users for whom the presence of another person is a known self-regulation aid.

**What fails:** The relationship is almost entirely transactional and non-persistent. Sessions are typically with strangers. There is no role differentiation, no relational depth, and the evidence base is primarily anecdotal. The motivation mechanism works for immediate task completion but there is no evidence it transfers to longer-horizon goals.

**One adaptable feature:** The *goal-statement-at-start, report-at-close* micro-structure. Even in a 15-minute check-in, stating "here is what I am working on this week" and later "here is what I did" creates a witnessed commitment loop that is low-overhead and easily digitised. This is a complementary feature to the monthly council session, not a replacement for it.

### 6.7 Buurtzorg

**What works:** Buurtzorg's 10-12 person self-managing nursing teams have no supervisors or middle managers. Each team handles its own hiring, budgeting, and scheduling. A small corps of 20 internal coaches (each supporting 40-50 teams) provides support during difficulties and transitions. Patient satisfaction is 30% higher than comparable organisations; care hours required per patient are 50-67% lower.

The Buurtzorg finding most relevant to eskp.in: autonomous, flat teams with a coaching support layer produce dramatically better outcomes than hierarchical managed teams. The 20 coaches are not managers — they have no authority. They are available, skilled, and trusted.

**What fails:** Scaling self-management requires very specific cultural conditions and tooling investment. Buurtzorg took years to develop its information systems. The model fails when teams do not have adequate skill diversity or when interpersonal conflicts within the team have no escalation path.

**One adaptable feature:** The *coach role as non-authority support* model. The platform equivalent is a trained facilitator (human or AI-assisted) who is available to help panels that are stuck — not to manage the panel or adjudicate disputes, but to offer process support. This is distinct from the user's advisor panel and resolves the failure mode of dysfunctional group dynamics with no escalation path.

---

## Section 7: Open Questions

These are questions the research could not resolve. Each requires either primary user research or product experimentation. The question type (research question, product experiment, or both) is specified.

**Q1: Does the vicarious satiation risk apply when the observer and the observed have different structural roles?**

The Reynolds et al. (2019) weight-loss study showed satiation when group members pursued the same goal. The CoSA model suggests different dynamics with role-differentiated groups. But there is no direct empirical study of whether role differentiation eliminates vicarious satiation in a goal-pursuit advisory context.

Evidence needed: A controlled product experiment (type: product experiment) comparing users in same-goal groups vs. role-differentiated advisory groups, measuring actual action completion rates over 3 months, not stated intentions.

**Q2: How does Indian izzat culture specifically modify disclosure dynamics on a digital advisory platform?**

The research on face-saving in South Asian contexts is primarily from diaspora populations and professional settings. There is no published study of how izzat dynamics operate in digital peer advisory contexts in India specifically. The risk is that users disclose selectively in ways that prevent advisors from understanding the actual situation.

Evidence needed: Qualitative user research (type: primary research) with 15-20 Indian users at different class and caste positions, exploring what they would and would not disclose to a panel of advisors they know vs. advisors they don't know, and what structural features (anonymity, role definitions, confidentiality protocols) would affect their willingness to be honest.

**Q3: What is the minimum viable advisor engagement to produce benefit for the user?**

The mentoring research on consistency suggests that quality and frequency of contact matters. But there is no established minimum threshold for an advisory platform. Can a monthly 90-minute session produce meaningful self-efficacy gains? Does weekly async check-in make a significant difference? Can a user achieve meaningful benefit from advisors who respond to check-ins only 50% of the time?

Evidence needed: Cohort analysis (type: product experiment) of user outcomes (goal progression, autonomy score, wellbeing rating) segmented by advisor engagement frequency and depth over a 6-month period.

**Q4: Is the questions-only rule culturally transferable to an Indian advisory context?**

The Quaker clearness committee operates in a context of egalitarian religious community and extensive preparation. High power distance cultures typically expect authority figures to give direction, not ask questions. An advisor who only asks questions may be perceived as unhelpful, evasive, or incompetent by Indian users who expect expert advisors to provide answers.

Evidence needed: Structured product experiment (type: product experiment) comparing advisory panels using the questions-only protocol vs. direct advice protocol with Indian users, measuring both user satisfaction and user progress metrics.

**Q5: Can advisor role identity genuinely form via a digital platform, or does it require face-to-face interaction?**

The role identity research demonstrates that volunteers who internalise their advisor role sustain engagement. But this research is almost entirely from in-person contexts. Whether the same identity formation occurs in digital advisory relationships — where non-verbal cues, physical presence, and social embeddedness are absent — is not known.

Evidence needed: Qualitative interviews (type: primary research) with advisors at 3, 6, and 12 months of platform use, exploring how they describe their identity in relation to their advisory role.

**Q6: What is the right mechanism for goal revision that preserves user dignity and advisor investment?**

When a user's goal changes substantially, the advisory panel's context and calibration is partly invalidated. There is no research on how to handle this transition in a persistent advisory relationship. Getting it wrong risks either trapping users in outdated goal frames or causing advisors to feel their investment was wasted.

Evidence needed: Co-design sessions (type: primary research) with early users and advisors to prototype and test goal revision protocols before building them into the product.

**Q7: Does the dual-benefit framing (advisor growth as a stated objective) change the population of people who volunteer to be advisors?**

The research suggests dual-benefit framing reduces burnout. But the composition of people willing to be advisors under "I'm here to grow too" framing may be different from those attracted to a pure-helper framing. The platform needs advisors who are genuinely helpful, not people who are primarily there for their own development and use the advisory relationship instrumentally.

Evidence needed: Advisor onboarding experiment (type: product experiment) comparing dual-benefit framing vs. altruistic framing at recruitment, measuring both advisor quality scores (from users) and advisor retention over 6 months.

**Q8: What structural features prevent the panel from becoming a caste/class-stratified social hierarchy?**

India's social structure means that advisor panels will inevitably contain participants at different positions in caste, class, and gender hierarchies. Whether these external hierarchies reproduce themselves inside the advisory panel — with lower-caste or lower-class advisors deferring to higher-status ones — is unstudied in digital advisory contexts but is a known dynamic in Indian professional settings.

Evidence needed: In-product data analysis (type: product experiment) of message-sending patterns within advisory panels, testing whether message volume and initiation rates correlate with advisor social status indicators.

---

## Summary: What Would Falsify the Platform Concept

The following findings would significantly weaken or falsify the core thesis:

1. Indian users, when surveyed, report that they would not disclose meaningful personal struggles to a panel of advisors even with strong privacy protections — because izzat dynamics override structural protections.

2. Advisors, at 6-month measurement, report no personal benefit from the advisory role. Without the dual-benefit, advisor retention will not be sustainable at scale.

3. Users in role-differentiated advisory panels show vicarious satiation effects comparable to homogeneous goal-pursuit groups — meaning role differentiation does not protect against the satiation mechanism.

4. The questions-only advisory protocol produces significantly lower user satisfaction scores among Indian users than direct advice-giving, indicating cultural incompatibility.

5. Platform interaction data shows that panel dynamics quickly stratify by external social status, reproducing the exact hierarchy the platform is designed to disrupt.

Items 1 and 4 can be tested with qualitative research before building. Items 2, 3, and 5 require operating product data. The platform should design its first cohort explicitly as a structured experiment to generate this evidence.

---

## Document Metadata

**Domains researched:** 6 of 6 specified
**Sources consulted:** 60+ primary and secondary sources
**Web searches conducted:** 25
**Key gaps identified:** Empirical literature on executive peer advisory structures is extremely thin; Indian-specific digital advisory context is unstudied; vicarious satiation in role-differentiated groups is unresolved
**Primary research required before constitutional amendment:** Questions 1, 2, and 4 above should be resolved with 15-20 user interviews and a small pilot cohort before platform architecture is locked

---

Sources (selected, reflecting primary research cited):

- [A large-scale field experiment shows giving advice improves academic outcomes for the advisor | PNAS](https://www.pnas.org/doi/10.1073/pnas.1908779116)
- [Seeking Advice Boosts Perceptions of Competence | HBS](https://www.hbs.edu/ris/Publication%20Files/Advice%20Seeking_59ad2c42-54d6-4b32-8517-a99eeae0a45c.pdf)
- [An empirical ranking of the importance of the sources of self-efficacy for physical activity](https://pmc.ncbi.nlm.nih.gov/articles/PMC12502103/)
- [Mentoring Relationships and Adolescent Self-Esteem - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3873158/)
- [Self-regulatory consequences of observing others making goal progress | British Journal of Health Psychology](https://bpspsychub.onlinelibrary.wiley.com/doi/abs/10.1111/bjhp.12389)
- [Vicarious goal satiation - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3630077/)
- [Circles of Support and Accountability - Wikipedia](https://en.wikipedia.org/wiki/Circles_of_Support_and_Accountability)
- [Looking inside a circle: volunteer experiences of CoSA - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6762178/)
- [Associations of Group Size with Cohesion and Clinical Outcomes in Group Psychotherapy: A Systematic Review](https://www.tandfonline.com/doi/full/10.1080/00207284.2025.2456020)
- [HOPEFUL: Helping Others Promotes Engagement and Fulfillment](https://www.tandfonline.com/doi/full/10.1080/10463283.2024.2368393)
- [Role Identity, Organizational Experiences, and Volunteer Performance](https://www.researchgate.net/publication/247746641_Role_Identity_Organizational_Experiences_and_Volunteer_Performance)
- [An Exploration of the Psycho-Social Benefits of Providing Sponsorship in 12 Step Groups - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7967695/)
- [Clearness Committees - Friends General Conference](https://www.fgcquaker.org/fgcresources/practical/practices/clearness-committees/)
- [EXECUTIVE PEER ADVISORY GROUPS - Digital USD](https://digital.sandiego.edu/cgi/viewcontent.cgi?article=1935&context=dissertations)
- [The Power of YPO Forum Practices in Organisations](https://blog.risebeyond.org/the-power-of-ypo-forum-practices-in-organisations)
- [Buurtzorg: scaling up an organization with hundreds of self-managing teams](https://link.springer.com/article/10.1007/s41469-024-00184-y)
- [Self-esteem and self-efficacy in the status attainment process | PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7026146/)
- [The role of self-efficacy and self-esteem in mediating positive associations between functional social support | Tandfonline](https://www.tandfonline.com/doi/full/10.1080/09638237.2022.2069695)
- [AI-Mediated Communication in E-Commerce: Implications for Customer Trust | Wiley](https://onlinelibrary.wiley.com/doi/10.1111/ijcs.70111)
- [The AI-mediated communication dilemma: epistemic trust | Springer](https://link.springer.com/article/10.1007/s11229-025-04963-2)
- [Does culture influence mentoring perspectives? India and the US | ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1061951825000059)
- [Anonymity and Online Self-Disclosure: A Meta-Analysis](https://www.tandfonline.com/doi/full/10.1080/08934215.2019.1607516)
- [Cohesion in group therapy: A meta-analysis | Semantic Scholar](https://www.semanticscholar.org/paper/Cohesion-in-Group-Therapy:-A-Meta-Analysis-Burlingame-McClendon/611bd981309d5222ef82b4f2eeda2cb1c1c01409)
- [Social support, organizational characteristics, and well-being in three self-help group populations | Springer](https://link.springer.com/article/10.1007/BF00906072)
