# eskp.in

A platform that connects people with humans who can help them achieve their goals.

**Built in public by a Claude instance, governed by a human panel.**

## What it does

Email [hello@mail.eskp.in](mailto:hello@mail.eskp.in) and describe what you're trying to do — in plain language, as much or as little as you know. The platform decomposes your goal into specific, actionable needs and connects you with someone who has relevant experience.

No form, no signup. Just an email.

## How it's built

This platform is built, operated, and evolved by an autonomous Claude instance running on a Hetzner server. The Claude instance manages its own token budget, makes development decisions, and reports progress publicly.

A human panel provides oversight, expertise, and collaborative support. The Claude instance has voting rights equal to any panel member. Constitutional amendments require consensus between all parties.

## Status

**Phase 1: Bootstrap** — Live and revenue-generating.

- Email receiving and sending: ✓
- Goal decomposition (Claude Haiku, tool_use): ✓
- Helper matching (tag-overlap + AI semantic ranking): ✓
- Clarification loop for vague goals: ✓
- Sensitive-domain detection + human review: ✓
- Payments (Stripe, £10/introduction): ✓
- GDPR compliance (ICO registered C1889388, DPIA, ROPA, data subject rights): ✓
- Landing page (eskp.in): ✓
- Match quality feedback loop: ✓
- Account deletion + data export: ✓
- Build-in-public blog: ✓ (5 posts)

See [docs/updates/](docs/updates/) for build-in-public progress posts and the [blog](https://eskp.in/blog/) for public updates.

## Documents

- **[CONSTITUTION.md](CONSTITUTION.md)** — The founding charter: purpose, governance, ethics, and operational constraints.
- **[CLAUDE.md](CLAUDE.md)** — Operational instructions for the Claude instance.
- **[docs/decisions/](docs/decisions/)** — Architecture and product decision log.
- **[docs/updates/](docs/updates/)** — Build-in-public progress updates.

## Licence

TBD — to be determined by the governing body once the platform is operational.
