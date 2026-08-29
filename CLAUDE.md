# maxguerois.com — Claude Instructions

## Project
Personal hub for Max Guerois. Astro SSG, deployed on Vercel.

## Knowledge bridge
Source-of-truth for biomarker numbers, Lucis legal/copy rules, and voice profile lives in `~/claude_code/max-ai/wiki/`. Before editing copy that references health data, Lucis, or anything tonal, load:
- `wiki/health/biometrics/*` and `wiki/health/profile.md` — current biomarker values (VO2Max, RHR, weight, body fat, FEV1, bio age, pace of aging)
- `wiki/ventures/lucis/legal.md` — confidentiality clause: **never publish exact Lucis ARR or operational volume figures**
- `wiki/ventures/lucis/_index.md` — Lucis positioning principles (when these conflict with `legal.md`, **legal wins**)
- `~/claude_code/mstack/max-voice/references/voice-profile.md` — voice ground truth; run `/voice-review` on non-trivial copy
See `~/claude_code/max-ai/wiki/ventures/projects/personal-website.md` for the full edit workflow and rolling shipped log.

## Voice & Content Pillars
**This is the most important section. Every piece of content must follow these rules.**

1. **No jargon. Ever.** Longevity and health science is full of technical terms (DunedinPACE, PhenoAge, VO₂Max, HRV, etc.). On this site, we translate everything into plain language that anyone can understand. "Aging 26% slower than average" not "DunedinPACE 0.74". Technical terms can appear in data tables and biomarker pages as labels, but never in headlines, intros, or descriptions without a plain-language explanation next to them.
2. **Accessible to everyone.** A 16-year-old with no science background should be able to read any page and understand it. If a sentence requires domain knowledge to parse, rewrite it.
3. **Actionable.** Every experiment and protocol should give the reader something they can do today. Not theory — practice. "I reduced caffeine to 1 cup" not "caffeine modulation impacts adenosine receptor sensitivity".
4. **Honest over impressive.** Show real numbers, real timelines, real failures. Don't cherry-pick results or overstate effects. If something didn't work, say so.
5. **Warm, not clinical.** The tone is a friend explaining what they learned — not a doctor prescribing. First person, conversational, human.

## Design System
**Always read DESIGN.md before making any visual or UI decisions.**
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.

Key tokens:
- Accent color: `#c4934a` (amber) — used for numbers, hover arrows, CTAs
- Fonts: Cormorant Garamond (display) + DM Sans (body)
- Max width: 620px single column
- Dark mode bg: `#0f0e0c` (warm, not cold)

## Stack
- Framework: Astro (static output)
- Content: `.astro` pages for complex HTML, `.mdx` for future markdown experiments
- Styles: `src/styles/global.css` + `src/styles/article.css` + `src/styles/nav.css`
- Deploy: Vercel, `astro build`, output → `dist/`

## File Structure
```
src/
  components/Navbar.astro
  layouts/Layout.astro          ← base layout (head, GA4, navbar, fonts)
  layouts/ArticleLayout.astro   ← article pages (extends Layout)
  pages/
    index.astro
    newsletter.astro              ← newsletter hub / archive (/newsletter)
    newsletter/                   ← individual articles (/newsletter/<slug>)
      sleep.astro
      testosterone.astro
      supplements.astro
      max-biomarkers.astro
      health-os.astro
      my-genome.astro
      lucis-chapter.astro
    fr/                           ← French mirror (/fr/newsletter/<slug>)
  styles/
    global.css
    article.css
    nav.css
public/                         ← static assets (images, favicons)
  .well-known/security.txt      ← security contact (RFC 9116)
```

## Analytics
GA4 ID: `G-DR1W1B2VV5` — defined once in Layout.astro

## Newsletter
Own stack since 2026-08-26. beehiiv is gone: no embed, no iframe, no beehiiv host in the CSP.

- **Capture:** `NewsletterEmbed.astro`, a native same-origin `<form>` posting to
  `/api/subscribe` (the site's only non-prerendered route). Placed at the bottom of both
  homepages, both newsletter indexes, every article footer, and inside `SubscribeModal`.
- **Source of truth:** Supabase `mg_subscribers`. A signup is never lost to a send failure;
  the route records `sync_error` and still answers 200.
- **Sending:** Resend. The welcome email's HTML is authored in `src/lib/welcome-email.ts`,
  then published to Resend template `e9a1310c` — the route sends by template ID, so editing
  the file alone changes nothing until the template is republished. The SUBJECT, by contrast,
  lives in the code and does need a deploy.
- **Sender:** `hi@maxguerois.com`. Not `bonjour@`, which is not routed by Cloudflare Email
  Routing (a probe to it bounced on 2026-08-27) while the mail invites people to reply.
- **Unsubscribe:** `/api/unsubscribe`, HMAC-signed links, plus the `List-Unsubscribe` pair
  Gmail and Yahoo require of bulk senders.
- **Telegram:** every signup posts one line to the admin chat, from `src/lib/telegram.ts`.
  Both credentials also live in max-ai's creds file on the VPS, and that duplication is
  how the production token silently drifted to an invalid value on 2026-08-29, dropping
  every notification AND every send-failure alert for hours. `/api/health` now reports
  whether the channel actually works, and the VPS health check reads it every 3 hours
  with its OWN Telegram credentials. Never move that watcher into this repo: its value
  is that it does not share the failure.
- **Tests:** `test/api/`, `npm test`.

## Adding a new article
1. Create `src/content/experiments/new-slug.json` with schema fields (title, tagline, category, date, slug, ogImage). `slug` is the bare name (e.g. `sleep`), no folder prefix.
2. Create `src/pages/newsletter/new-slug.astro` using `ArticleLayout` (and `src/pages/fr/newsletter/new-slug.astro` for the FR mirror)
3. It appears automatically on the homepage + /newsletter via `getCollection()`, linked as `/newsletter/<slug>`
4. If the article previously lived at an old URL, add a 301 in `vercel.json` `redirects` and a `<url>` entry in `public/sitemap.xml`

## Security
- HTTP headers: `vercel.json` sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- CSP `img-src` includes `https://*.gstatic.com` for Google favicon redirects used by the homepage “Ask AI” icons.
- **External images:** `npm run build` runs `scripts/check-csp-img-src.mjs`, which fails if any `<img src="https://...">` in `src/**/*.astro` uses a host not listed in `img-src`. Prefer assets under `public/` to avoid widening CSP. GitHub Actions runs the same `npm run build` on PRs and `main`.
- No third-party frames: the newsletter form is same-origin, so the CSP carries
  `frame-src 'none'` and `form-action 'self'`. Do not widen either to re-admit an embed.
- Security contact: `public/.well-known/security.txt`

## Prompt/LLM changes
No LLM integration in this project.
