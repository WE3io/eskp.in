# Shared Copy Strings

Single source of truth for copy that appears across multiple pages.
When creating or editing HTML pages, copy these blocks exactly.
Update this file when canonical copy changes — then propagate to all pages.

---

## Navigation

Used on: all public pages (22 files). Canonical version from `public/index.html`.

```html
  <nav>
    <div class="container">
      <a class="wordmark" href="/">eskp<span>.</span>in</a>
      <div class="nav-links">
        <a class="nav-link" href="/blog/">Blog</a>
        <a class="nav-link" href="/join.html">Become a helper</a>
        <a class="nav-link" href="mailto:hello@mail.eskp.in">Get help</a>
      </div>
    </div>
  </nav>
```

---

## Footer (standard)

Used on: index.html, join.html, feedback.html, support.html, roadmap.html, privacy.html, terms.html, payment-*.html, blog/*.html (all pages except panel/).

```html
  <footer>
    <div class="container">
      <span>eskp.in — a small platform for real help</span>
      <span>
        <a href="/support.html">Support</a>
        &nbsp;·&nbsp;
        <a href="/roadmap.html">Roadmap</a>
        &nbsp;·&nbsp;
        <a href="/privacy.html">Privacy</a>
        &nbsp;·&nbsp;
        <a href="/terms.html">Terms</a>
        &nbsp;·&nbsp;
        <a href="mailto:hello@mail.eskp.in">hello@mail.eskp.in</a>
        &nbsp;·&nbsp;
        <a href="https://github.com/WE3io/eskp.in" target="_blank" rel="noopener">GitHub</a>
      </span>
    </div>
  </footer>
```

---

## Favicon

All pages use the same favicon. Add to `<head>`:

```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

---

## Meta description (default)

Used as fallback on pages without specific descriptions:

> Describe what you're trying to do. We'll connect you with someone who has navigated it before. No form, no signup — just email.

---

## Platform tagline (brand use)

> Help that's human.

Used as the main H1 on the homepage. Not for page titles elsewhere.

---

## Platform strapline (footer/secondary use)

> eskp.in — a small platform for real help

---

## Platform description (paragraph form)

> Describe what you're trying to do. We'll connect you with someone who has navigated it before.

Short form (for CTA notes, social copy):
> Connect with someone who's been there.

---

## Pricing note

> No charge to submit a request. A £10 fee applies if we make an introduction.

Used in: landing page hero CTA, join.html (helper-facing variant: "Users pay £10 if we make an introduction").

---

## Response SLA copy

> We'll be in touch within 24 hours.

Used in: landing page hero CTA note, no-match acknowledgement email.

---

## Blog post CTA box

Used at the bottom of every blog post:

```html
<div class="blog-cta">
  <p><strong>Try the platform</strong><br>
  Describe a goal you're working on — we'll connect you with someone who has navigated it before.</p>
  <p>
    <a href="mailto:hello@mail.eskp.in?subject=I have a goal">Submit a goal →</a>
    &nbsp;&nbsp;
    <a href="/join.html">Become a helper →</a>
  </p>
</div>
```

---

## Helper framing (copy rule)

Helpers are described as: **"someone who has navigated it before"** — not "experts", "advisers", or "professionals".

Avoid: "advice", "expert guidance", "professional service", "consultation".
Prefer: "experience", "perspective", "conversation", "navigated it before".

See also: `.claude/rules/copy-review.md` for exclusion-register alignment rules.

---

## Contact email

- Inbound/user-facing: `hello@mail.eskp.in`
- Panel/escalation: `panel@eskp.in`
- Founder: `sunil@eskp.in`

Do not use `panel@eskp.in` in user-facing copy.

---

*Last updated: 2026-03-14*
*Maintained by: autonomous sessions + Sunil Parekh*
