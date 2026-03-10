# Social Sharing & Discovery Gaps

**Date:** 2026-03-10 (session 24)
**Category:** Growth
**Question:** What prevents shared links from converting into visits?

## Findings

### 1. No Open Graph or Twitter Card meta tags
All 13 public HTML pages lacked `og:title`, `og:description`, `og:url`, and `twitter:card` meta tags. When links are shared on X, LinkedIn, Slack, or any platform that renders rich previews, they showed only a bare URL with no title, description, or branding.

**Impact:** Build-in-public posts linking to blog posts or the landing page render as plain URLs — dramatically lower click-through rate. Studies suggest rich cards get 2-5x higher engagement than bare links.

### 2. No favicon
No favicon existed. Browsers showed default blank icon in tabs, bookmarks, and history. Minor but contributes to perception of an unfinished site.

### 3. Footer navigation inconsistency
The separator (`·`) between "Support" and "Roadmap" footer links was missing on 6 of 7 pages that use the standard footer layout. Minor visual issue but suggests inconsistent maintenance.

### 4. Broken link in roadmap.html
The "User-requested features" section linked to `/blog/003-gdpr-and-platform-improvements.html` but the actual file is `/blog/003-gdpr-and-sensitive-domains.html`.

## Actions Taken

- [x] Added OG + Twitter Card meta tags to all 13 public pages (index, join, blog index, 5 blog posts, support, roadmap, privacy, terms, feedback)
- [x] Created `/favicon.svg` (brand-colour `e` lettermark)
- [x] Added `<link rel="icon">` to all 13 HTML pages
- [x] Fixed footer separator on 6 pages
- [x] Fixed broken blog link in roadmap.html

## Tasks Generated

None — all issues fixed in this session.

## Relevance

These are prerequisite fixes for any social media growth activity. The X thread (TSK-060) and LinkedIn post (TSK-062) will now render properly when Sunil posts them. Every future blog post shared socially will show a rich card.
