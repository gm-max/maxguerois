# SEO & GEO Requirements

> **Status: PROPOSED — for review.** Nothing in here is implemented yet.
> This spec is derived from an audit of the codebase (2026-06). Review, edit,
> or re-prioritize the requirements below; implementation happens in follow-up PRs.
>
> **Verification pass (mega-check):** each requirement was traced back to a spotted
> issue against the code. Findings baked in below:
> - `lucis-chapter` (EN + FR) is **not** in the content collection, so REQ-1/REQ-4
>   need an explicit data source for it (see caveats).
> - Heading structure is already clean (1 `<h1>`/page verified) — REQ-6 is a
>   regression guard, not a fix.
> - REQ-9 (breadcrumbs) is an enhancement, not tied to a spotted issue.
> - The client-side FR redirect (a minor spotted issue) is now tracked as REQ-10.

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
- **⚠️ Data-source caveat (verified):** the content collection has only 6 EN + 6 FR
  entries — `lucis-chapter` (EN + FR) is **not** in it, so it has no `date`/`image`
  to source from. Sub-requirement: **add `lucis-chapter` to the collection**
  (preferred) or pass `datePublished`/`image` explicitly in those two pages.
- **Acceptance:** all 14 articles (incl. `lucis-chapter`) carry a
  `<script type="application/ld+json">` with `@type: Article`; passes Google Rich
  Results Test; build + CSP pass; no console errors.

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

- **⚠️ Data-source caveat (verified):** same as REQ-1 — `lucis-chapter` has no
  collection date; and the home/hub URLs have no intrinsic date. Decide a source
  for those (e.g. build date, or newest-article date for the hub).
- **Acceptance:** every `<url>` has a W3C-format `<lastmod>`. (Consider generating
  the sitemap from the content collection so it can't drift.)

### REQ-5 · OG image metadata
Add `og:image:width`, `og:image:height`, `og:image:alt`; ensure the default share
image is a 1200×630 asset.

- **Scope:** `Layout.astro` head.
- **Acceptance:** the three `og:image:*` tags render on every page; default `ogImage`
  is 1200×630.

### REQ-6 · Heading hierarchy (regression guard — no defect found)
Exactly one `<h1>` per page; subheads ordered `h2`/`h3` with no skipped levels.

- **Note:** spot-check confirmed pages already have exactly **1 `<h1>`**. This is a
  *guard*, not a fix — verify across all pages and keep it from regressing. Low value;
  could be dropped or folded into a CI check.
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

### REQ-9 · Breadcrumb schema (enhancement — not a spotted issue)
`BreadcrumbList` JSON-LD on articles: Home › Newsletter › Article.

- **Note:** additive nicety, not tied to an audit finding. Keep only if wanted.
- **Acceptance:** articles emit valid breadcrumb schema.

### REQ-10 · Crawler-safe locale redirect
The client-side "FR browser → `/fr`" redirect in `Layout.astro` should not create
crawler/indexing ambiguity. hreflang already gives the correct signal, so this is
low risk — but make it intentional.

- **Options:** skip the redirect for known bots, or rely purely on hreflang and
  drop the auto-redirect, or accept as-is and document why.
- **Acceptance:** documented decision; if kept, verified not to interfere with
  Googlebot indexing the canonical (en) URLs.

---

## Out of scope

- Content rewrites / editorial changes
- Off-page SEO (backlinks, outreach)
- Performance work (already strong — static SSG, webp, CWV)

## Tracking checklist

- [x] REQ-1 · Article structured data (14/14 articles)
- [x] REQ-2 · HowTo schema (sleep 7 steps + testosterone 31 steps; supplements/health-os intentionally skipped)
- [x] REQ-3 · llms.txt
- [x] REQ-4 · Sitemap lastmod (generated from collection)
- [x] REQ-5 · OG image metadata (+ default fixed to og.jpg)
- [x] REQ-6 · Heading hierarchy — verified 1 h1/page on all 19 pages (no CI guard added)
- [x] REQ-7 · 404 noindex
- [ ] REQ-8 · Explicit AI-crawler policy (P3, not in this PR)
- [ ] REQ-9 · Breadcrumb schema (P3, not in this PR)
- [ ] REQ-10 · Crawler-safe locale redirect (P3, not in this PR)

## Implementation notes / deviations (P1+P2 PR)

- **lucis-chapter** was NOT added to the collection (would have bumped an
  experiment off the home top-3 and into the archive). Instead it passes
  `headline` + `datePublished` directly to ArticleLayout — the doc's approved
  alternative. Its date is **2026-06-09**, the article's own visible dateline
  (not the June 3 git-creation date), so schema matches the visible date.
- **REQ-2 value:** Google deprecated HowTo/FAQ rich results in 2023, so the
  payoff is GEO (AI-engine extraction), not Google rich snippets.
- **Em-dashes:** all authored JSON-LD is em-dash-free. Note a *separate*
  pre-existing issue remains out of scope: visible `<title>` tags use the
  "Page — Max Guerois" convention, and some article bodies / i18n strings use
  em-dashes. Recommend a dedicated copy pass.

## Traceability (issue → requirement)

| Spotted issue | Requirement | Solves? |
|---|---|---|
| No Article schema on 14 pages | REQ-1 | ✅ (needs `lucis-chapter` data source) |
| Articles lack datePublished/author | REQ-1 | ✅ (same) |
| No HowTo/FAQ on tip articles | REQ-2 | ✅ (per-article validation) |
| No llms.txt | REQ-3 | ✅ |
| Sitemap no lastmod | REQ-4 | ✅ (needs date source for lucis-chapter + hub/home) |
| og:image missing dims/alt | REQ-5 | ✅ |
| 404 not noindex | REQ-7 | ✅ |
| AI-crawler access not explicit | REQ-8 | ✅ |
| Client-side FR redirect ambiguity | REQ-10 | ✅ (tracked) |
| _(no issue — guard)_ | REQ-6 | n/a — 1 h1/page already |
| _(no issue — enhancement)_ | REQ-9 | n/a — additive |
