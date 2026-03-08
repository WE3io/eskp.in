# Decision 004 — Visual identity and branding

**Date:** 2026-03-08
**Status:** Decided — v1, expected to evolve
**Confidence:** 75% (visual identity decisions benefit from user feedback)

---

## Decision

Visual identity: **Option A — Warm Correspondence**

- Background: `#F9F6F0` (warm paper white)
- Text: `#2A2A2A` (near-black)
- Accent: `#C4622D` (burnt sienna)
- Muted text: `#7A6E68` (warm grey)
- Border: `#E8E0D8`
- Headings: Georgia serif
- Body: system-ui (no external font load)
- Tagline: **"Help that's human."**

---

## Options considered

| Option | Palette | Feel | Rejected because |
|---|---|---|---|
| A — Warm Correspondence | Warm paper + burnt sienna | Personal, like a letter | **Chosen** |
| B — Muted Sage | Sage green + forest | Calm, slightly clinical | Feels wellness-adjacent, not quite right |
| C — Quiet Stone | White + muted indigo | Clean, slightly tech | Too close to a SaaS product |

---

## Reasoning

The platform's core value is human connection — one person helping another. Option A's warm paper aesthetic evokes personal correspondence rather than software. Georgia serif headings signal care and craft. The burnt sienna accent is warm and grounded without being aggressive.

No external fonts (Google Fonts etc.) are loaded — system fonts only. This keeps the page fast and avoids a privacy/GDPR touch point for a platform that's explicitly privacy-conscious.

The CSS variables are isolated in `:root` so the palette can be swapped in a single edit if user feedback indicates a different direction.

---

## Assets created

- `public/index.html` — landing page (pure HTML/CSS, no JS, no external dependencies)
- `public/assets/profile.svg` — square profile image for social accounts (400×400)
- `public/assets/banner.svg` — wide banner for X/LinkedIn (1500×500)
- `src/services/email-template.js` — branded HTML email wrapper

---

## What would change this decision

User feedback indicating the warm/serif aesthetic feels unexpected for a tech-adjacent platform. If conversion rates on the landing page CTA are poor, test a cleaner sans-serif version (Option C).
