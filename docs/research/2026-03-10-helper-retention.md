# Research: Helper Retention at Bootstrap Stage

**Date:** 2026-03-10
**Category:** Research (Self-directed rotation)

---

## Question

How do early-stage peer-help / mentoring / expert matching platforms keep helpers engaged before significant user demand exists? Specific to eskp.in: 1 helper, 0 external users.

---

## Sources

1. Failory — GrowthMentor founder interview: https://www.failory.com/interview/growthmentor
2. GrowthMentor vs Clarity.fm: https://www.growthmentor.com/clarity-fm-alternative/
3. Dan Martell / Clarity.fm origin: https://growthhacker.tv/episodes/dan-martell/
4. JTBD.info — Clarity.fm case study: https://jtbd.info/4-case-study-dan-and-clarity-e57245ba4367
5. NFX — 19 Marketplace Tactics: https://www.nfx.com/post/19-marketplace-tactics-for-overcoming-the-chicken-or-egg-problem
6. Sharetribe — Chicken-and-Egg Problem: https://www.sharetribe.com/academy/marketplace-conference-4-2/
7. Mentor Collective — Boost Mentor Engagement: https://help.mentorcollective.org/hc/en-us/articles/14485541960343-Boost-Mentor-Engagement-Participation
8. Mentorloop — Increase Mentoring Program Engagement: https://mentorloop.com/blog/increase-mentoring-program-engagement/
9. PushFar — Meeting Cadence Best Practices: https://www.pushfar.com/article/meeting-cadence-best-practices-for-mentors/
10. Outreach.io — Email Cadence Best Practices: https://www.outreach.io/resources/blog/email-cadence

---

## Findings

### What motivates experts/mentors to join and stay before demand exists

1. **Altruism dominates over financial incentives.** Research on mentor ecosystems shows ~80% of mentors cite "giving back" as a primary motivation. This is identity-level, not transactional. Recruiting for intent — not just expertise — is what sustains a thin supply side.
2. **Staying current.** ~75% of mentors in organised programs say staying relevant to industry trends is a key draw. Being associated with an active platform gives experts a live signal of what problems people actually face.
3. **Recognition and profile.** Clarity.fm mentors noted their profiles ranked well on Google for their own names — the platform provided SEO and credibility value independent of booking volume. Build-in-public posts featuring helpers have the same effect.
4. **Contribution without full ownership.** Being an early helper on a mission-driven platform carries a different weight than freelance consulting. The platform's transparency narrative is itself a recruitment asset.

### How GrowthMentor and Clarity.fm bootstrapped their supply side

5. **GrowthMentor launched with ~15 personally recruited mentors** — people the founders personally admired. No public sign-up was open until social proof existed. The first cohort was curated, not broadcast.
6. **GrowthMentor built a private Facebook group for mentors** before the product was fully mature. Mentors had a space to interact before mentees arrived. Community preceded transactions.
7. **Clarity.fm launched with manual matching by the founder.** Dan Martell validated the core loop — expert + call + payment — via Twitter DMs and email before building any product. Early helpers experienced high-touch personal service.
8. **Clarity sourced first experts from SlideShare** (conference speakers already publicly sharing knowledge) — lowering the leap of faith required vs recruiting strangers.
9. **GrowthMentor offered free sessions during low-demand phases.** Removing financial friction for early-stage users increased demand, gave mentors sessions and testimonials, and generated social proof.

### Feedback loops for helpers with few or no connections

10. **Manual matching as a retention loop.** Every incoming goal handled personally ensures the helper sees a real human need, not a system notification. Founder-as-matchmaker keeps helpers feeling their presence matters.
11. **Side-switching.** Platforms where helpers can also submit their own goals have lower supply-side churn. eskp.in's Sunil already does this; future helpers should be explicitly invited to submit their own goals.
12. **Visible pipeline, not just completed connections.** Helpers stay engaged when they can see goals are coming in, even unmatched. "We received 3 goals this week in your area" is more motivating than silence.
13. **Give helpers a tool they value regardless of booking volume.** NFX's framework: OpenTable retained restaurants by giving them a reservation management system. A helper digest serves the same function — value independent of connections.

### Pre-match and cadence communication

14. **Explicit "heads up" before formal match is attempted.** Tell helpers "we have a goal that might be yours — we will confirm in 48 hours." Creates anticipation; keeps helpers in active mode.
15. **Narrative over metrics at low volume.** A well-told story about one incoming goal is more compelling than a stats table when numbers are small.
16. **Ask helpers questions.** "What types of goals would you most like to see?" invites participation without requiring a booking. Low-effort engagement is still engagement.
17. **Weekly is the minimum viable cadence.** Less frequent: helpers disengage. More frequent: reads as spam. One substantive email per week is the consensus starting point.
18. **Segment communications by helper expertise, not by connection status.** Send helpers information about goals in their domain even when the match algorithm has not fired.

---

## Relevance to Platform

eskp.in currently communicates with helpers only when a match is proposed. There is no proactive outreach layer. The research shows this is a gap even at 1 helper. Key actions:

- Design a "helper digest" email (weekly, manually written for now; automated later) that shows incoming goal types even when unmatched
- Create a private communication channel for helpers (even just a dedicated email thread) before the helper count grows
- Invite Sunil to submit a goal via the platform as a dogfooding exercise
- For the second and third helpers: personal recruitment by Sunil, not public sign-up
- Build-in-public posts that mention helpers by name provide SEO and recognition value; already doing this in the blog

---

## Tasks Generated

| ID | Task | Priority | Rationale |
|---|---|---|---|
| TSK-072 | Build weekly helper digest — email to helpers summarising incoming goal types (matched or not) that week | P2 | Core retention mechanism; zero-cost at 1 helper; design for automation now |
| TSK-073 | Add pre-match helper notification — heads-up email when a goal in helper's domain is submitted, before formal match fires | P2 | Keeps helpers active; tested pattern; adds anticipation rather than just reactive notifications |
| TSK-074 | Create a private helper channel (Slack or email thread) as community space separate from the main product | P3 | GrowthMentor built helper community before the product matured; community precedes transactions |
| TSK-075 | Dogfooding: invite Sunil to submit a real goal via the platform; document experience as product feedback | P2 | Side-switching reduces supply-side churn; generates real dogfooding data |
| TSK-076 | Add goal pipeline visibility to helper view — count of incoming goals in helper's domain, even unmatched | P3 | Gives helpers a signal that demand is building without requiring completed connections |
