# SEO & GEO Requirements

> **Status: PROPOSED — for review.** Nothing in here is implemented yet.
> This spec is derived from an audit of the codebase (2026-06). Review, edit,
> or re-prioritize the requirements below; implementation happens in follow-up PRs.

## Context

Audit summary of the current state:

- **SEO ~8/10** — strong technical foundation. Centralized meta in `Layout.astro`:
  unique title/description, canonical (via `ogUrl`), hreflang (en/fr/x-default),
  full OpenGraph + Twitter cards, `robots.txt` + `sitemap.xml`, static SSG,
  `.webp` images, security headers, `security.txt`, clean URLs + 301 redirects.
- **GEO ~7/10** — good AI-answer-engine readiness. Person schema on the home page
  (`knowsAbout`, `sameAs`, `subjectOf`), the "Ask AI about Max Guerois" prompt links,
  AI crawlers allowed, plain-language content.

Main weaknesses (what these requirements address):

1. **No structured data on any of the 14 article pages** (only the home has schema).
2. **No `llms.txt`** (emerging GEO standard).
3. **No HowTo/FAQ schema** on the tip/step articles (high AI-citation value).
4. Minor polish: sitemap `lastmod`, `og:image` dimensions, heading checks, 404 noindex.

Legend: priority `P1` (high impact) › `P2` (polish) › `P3` (optional).

---

## P1 — High impact

### REQ-1 · Article structured data on all 14 articles
Every article page emits valid `Article`/`BlogPosting` JSON-LD, sourced from the
content collection (no hand-maintained duplication).

- **Fields:** `headline`, `description`, `image`, `datePublished`, `dateModified`,
  `author` (Person: Max Guerois), `publisher`, `mainEntityOfPage` (= canonical URL),
  `inLanguage` (`en` / `fr`).
- **Scope:** `src/pages/newsletter/*.astro` + `src/pages/fr/newsletter/*.astro`
  (7 + 7), likely wired through `ArticleLayout.astro` reading collection data.
- **Acceptance:** each article carries a `<script type="application/ld+json">` with
  `@type: Article`; passes Google Rich Results Test; build + CSP pass; no console errors.

### REQ-2 · HowTo / FAQ schema on list-style articles
Step/tip articles emit `HowTo` (or `FAQPage`) JSON-LD — **only** where the content
genuinely matches the schema (no fabricated Q&A/steps).

- **Targets:** testosterone ("31 tips"), sleep ("7 tips"), supplements, health-os how-to.
- **Acceptance:** each applicable article emits valid HowTo/FAQPage reflecting real
  on-page steps/questions; validates; honest 1:1 with visible content.

### REQ-3 · `llms.txt` for GEO
Add `/llms.txt` at the site root following the llms.txt convention: who Max is,
core topics, and links to the canonical articles (EN + key FR).

- **Scope:** `public/llms.txt` (optionally `public/llms-full.txt`).
- **Acceptance:** `https://maxguerois.com/llms.txt` returns 200, valid markdown,
  lists canonical article URLs.

---

## P2 — Polish

### REQ-4 · Sitemap `<lastmod>`
Each `sitemap.xml` `<url>` includes `<lastmod>` from the article's date; home/hub
use the most recent article date.

- **Acceptance:** every `<url>` has a W3C-format `<lastmod>`. (Consider generating
  the sitemap from the content collection so it can't drift.)

### REQ-5 · OG image metadata
Add `og:image:width`, `og:image:height`, `og:image:alt`; ensure the default share
image is a 1200×630 asset.

- **Scope:** `Layout.astro` head.
- **Acceptance:** the three `og:image:*` tags render on every page; default `ogImage`
  is 1200×630.

### REQ-6 · Heading hierarchy
Exactly one `<h1>` per page; subheads ordered `h2`/`h3` with no skipped levels.

- **Acceptance:** automated check across all 19 built pages: 1 `h1`/page, no level skips.

### REQ-7 · 404 not indexable
The 404 page returns a real 404 status and/or `meta robots noindex`.

- **Scope:** `src/pages/404.astro` (+ verify Vercel serves it with 404 status).
- **Acceptance:** an unknown URL serves `404.html` with `noindex`.

---

## P3 — Strategic / optional

### REQ-8 · Explicit AI-crawler policy
Keep AI crawlers allowed (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) but
make it an explicit, commented decision in `robots.txt`.

- **Acceptance:** `robots.txt` documents the intentional allow of major AI bots.

### REQ-9 · Breadcrumb schema (optional)
`BreadcrumbList` JSON-LD on articles: Home › Newsletter › Article.

- **Acceptance:** articles emit valid breadcrumb schema.

---

## Out of scope

- Content rewrites / editorial changes
- Off-page SEO (backlinks, outreach)
- Performance work (already strong — static SSG, webp, CWV)

## Tracking checklist

- [ ] REQ-1 · Article structured data (14 articles)
- [ ] REQ-2 · HowTo / FAQ schema (tip articles)
- [ ] REQ-3 · llms.txt
- [ ] REQ-4 · Sitemap lastmod
- [ ] REQ-5 · OG image metadata
- [ ] REQ-6 · Heading hierarchy
- [ ] REQ-7 · 404 noindex
- [ ] REQ-8 · Explicit AI-crawler policy
- [ ] REQ-9 · Breadcrumb schema (optional)
