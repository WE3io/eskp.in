# Research: SEO Structured Data for Growth

**Date:** 2026-03-13
**Category:** Growth
**Question:** What SEO improvements can the platform make autonomously to improve organic discoverability?

---

## Sources

- Google Search Central: structured data documentation
- Previous growth research: docs/research/2026-03-10-growth-social-sharing.md (OG tags done)
- Previous growth research: docs/research/2026-03-11-growth-conversion-funnel.md (robots.txt, sitemap done)

## Findings

### Current state
- Open Graph + Twitter Card meta tags: done (session 24)
- robots.txt + sitemap.xml: done (session 30)
- Favicon: done (session 24)
- JSON-LD structured data: **missing** — no rich snippets possible

### What JSON-LD adds
1. **Organization schema** on landing page — shows business info in search results
2. **WebSite schema** — enables sitelinks search box
3. **BlogPosting schema** on blog posts — enables article rich results (headline, date, author)
4. **FAQPage schema** on landing page — FAQ-style content can appear as expandable results

### Priority
- BlogPosting schema has the highest value — 8 blog posts become eligible for article rich results
- Organization schema is low-effort, high-signal for brand queries
- FAQPage schema would require restructuring landing page content — defer

### Binding constraint reminder
The platform's primary growth constraint remains helper supply (1 helper). SEO improvements won't solve the cold start problem directly but do improve organic discoverability for when helpers are available. The recruitment drafts (docs/updates/002, 003) are still waiting for Sunil to post.

## Relevance

Low-effort, no-risk improvement. Structured data is additive — no downside.

## Tasks generated

- Add Organization + WebSite JSON-LD to index.html (done this session)
- Add BlogPosting JSON-LD to all 8 blog posts (done this session)
