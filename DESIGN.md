# Design System — maxguerois.com

## Product Context
- **What this is:** Personal hub — Max Guerois publishes health experiments, projects born from those experiments, and a newsletter community
- **Who it's for:** Health-minded founders, biohackers, repeat builders interested in longevity data
- **Space/industry:** Personal brand + founder health journal. Paul Graham meets Bryan Johnson.
- **Project type:** Editorial / personal site

## Aesthetic Direction
- **Direction:** Warm Editorial
- **Decoration level:** Minimal — typography does all the work
- **Mood:** The site should feel like a personal journal written by someone who obsesses over data but writes like a human. Warm, not clinical. Dense with information but never cluttered. The kind of site you bookmark and actually return to.
- **Reference sites:** paulgraham.com (minimal, content-first), blueprint.bryanjohnson.com (data-forward, health), levels.io (founder personal brand)

## Typography
- **Display/Hero:** Cormorant Garamond — weight **300** (light). Elegant, airy, editorial. The light weight lets the letterforms breathe at large sizes.
- **Body:** DM Sans — modern, readable, unpretentious. Pairs naturally with Cormorant.
- **UI/Labels:** DM Sans — weight 500, uppercase tracking for section labels
- **Data/Tables:** DM Sans with tabular-nums — clean, aligned, scannable
- **Code:** inherit (no code blocks in this site)
- **CSS Tokens:** `--font-display: 'Cormorant Garamond', Georgia, serif` · `--font-body: 'DM Sans', system-ui, sans-serif`
- **Loading:** Google Fonts — `Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500` + `DM+Sans:wght@300;400;500;600`
- **Scale:**
  - Hero: 52px / weight 300 / line-height 1.1 / letter-spacing -0.01em
  - H1 (article): 36px / weight 400 / line-height 1.2
  - H2 (section): 24px / weight 400
  - Body: 16px base / weight 400 / line-height 1.7
  - Label: 12px / weight 500 / uppercase / tracking 0.06em
  - Caption: 12px / italic / color tertiary

## Color

### Approach
Restrained. One warm accent + neutrals. Color is rare and meaningful. Amber is used only for display numbers, key hover states, and CTAs — never decoration.

### Light Mode
- **Background:** `#faf9f7` — warm off-white, not stark
- **Background subtle:** `#f4f2ee` — hover states, table headers, subtle cards
- **Text:** `#1a1a1a` — near-black, warm
- **Text secondary:** `#6b6b6b` — body paragraphs, descriptions
- **Text tertiary:** `#767676` — dates, captions, metadata (WCAG AA compliant: 4.54:1 on #faf9f7)
- **Border:** `#e8e6e1` — warm light gray, all dividers and card edges

### Accent — The Risk
- **Accent:** `#c4934a` — amber. Warm, earthy, skin-adjacent. Used for:
  - Biological age numbers and stat values (makes data feel alive, not technical)
  - Hover states on arrows (→ turns amber)
  - Newsletter CTA button fill
  - Article italic in hero headline
- **Accent light:** `rgba(196, 147, 74, 0.10)` — tag backgrounds, callout fills
- **Accent mid:** `rgba(196, 147, 74, 0.20)` — callout borders

### Dark Mode — The Second Risk
Warm dark (`#0f0e0c`) not cold dark (`#111111`). Keeps the editorial warmth at night.
- **Background:** `#0f0e0c`
- **Background subtle:** `#1a1815`
- **Text:** `#e8e4dc`
- **Text secondary:** `#9a9488`
- **Text tertiary:** `#6b6560`
- **Border:** `#2a2720`
- **Accent:** `#d4a55e` — slightly lighter than light-mode amber

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable (spacious enough to breathe, not too sparse for data)
- **Scale (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 120
- **CSS Tokens:** `--sp-1: 4px` · `--sp-2: 8px` · `--sp-3: 12px` · `--sp-4: 16px` · `--sp-6: 24px` · `--sp-8: 32px` · `--sp-12: 48px` · `--sp-16: 64px` · `--sp-20: 80px` · `--sp-30: 120px`
- **Section gap:** 80px (`--sp-20`) between major sections
- **Container padding:** 80px top/bottom, 24px (`--sp-6`) horizontal

## Layout
- **Approach:** Grid-disciplined — strict single column, 620px max-width
- **Max content width:** 620px
- **Mobile padding:** 24px horizontal (`--sp-6`), same as desktop. Was 22px, an off-scale hard-coded value; corrected 2026-08-26
- **Container top padding is 80px on BOTH breakpoints, and is not free space:** the navbar is `position: fixed` at 56px and `body` has no `padding-top`, so those 80px are 56 of navbar clearance + 24 of breathing room. Reducing them slides content under the navbar
- **Border radius scale:** sm:8px · md:10px · lg:12px · full:100px
- **Navbar:** Fixed, 52px height, frosted glass `backdrop-filter: blur(12px)`

## Motion
- **Approach:** Minimal-functional — only entrance animations and hover microinteractions
- **CSS Tokens:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` · `--duration-short: 150ms` · `--duration-base: 300ms` · `--duration-reveal: 600ms`
- **Entry animation:** `fadeUp` — `opacity: 0→1, translateY: 12px→0, var(--duration-reveal)`
- **Stagger:** 80ms delay per sibling
- **Hover:** `var(--duration-short)` ease — color, border-color, transform
- **Theme switch:** `var(--duration-base)` ease on background, color, border-color
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — disable all animations, instant transitions

## Components

### Writing Item (article link)
- **Style:** Encapsulated in bordered card with `border: 1px solid var(--border)`, `border-radius: var(--radius-md)`
- **Hover:** `background: var(--bg-subtle)`, arrow translates right + turns amber
- **Structure:** Title (Cormorant 16px) + meta (11px tertiary) + arrow
- **Multiple items:** Stacked with 1px gap, background border trick for shared borders

### Numbers Grid (homepage stats)
- **Layout:** 4 columns desktop (single row), 2 columns mobile
- **Values:** Cormorant Garamond 28px, accent color, weight 300, centered
- **Labels:** DM Sans 10px uppercase, centered
- **Borders:** 1px gap trick (background: border color, cells: bg color)
- **Content:** Health metrics only — Bio Age, Pace of aging, RHR, VO₂Max

### Stat Card (article inline)
- **Layout:** Flexible row, 1px gap trick for shared borders
- **Value:** Cormorant, accent, weight 300, centered
- **Label:** DM Sans 10px uppercase, centered

### Buttons
- **Primary:** `background: var(--text); color: var(--bg)` — hover turns accent
- **Outline:** `border: 1px solid var(--border)` — hover darkens border
- **Accent:** `background: var(--accent); color: #1a1a1a` — **never `#fff`**: white on `#c4934a` measures 2.76:1 and on `#d4a55e` 2.25:1, both failing WCAG AA. `#1a1a1a` gives 6.31:1 and 7.74:1.
- **Shape:** `border-radius: var(--radius-full)`, padding 9px 20px
- **Font:** DM Sans 13px weight 500

### Text Highlight
- **Style:** `background: var(--accent-light)` + `box-shadow: 0 0 0 3px var(--accent-light)` + `border-radius: 2px`
- **Purpose:** marks the load-bearing phrase inside a short editorial block, so the block can be scanned instead of read
- **Rules:** at most 3 per section, never on a full sentence, never inside a heading, never inside body copy longer than one line. The box-shadow is what makes it read as a highlighter stroke rather than a filled label — without it the mark hugs the glyphs too tightly
- **Colour:** reuses `--accent-light`, no new token. Works unchanged in dark mode
- **Not to be confused with** the Tag component, which is a bordered pill for metadata

### Tags
- **Default:** `bg-subtle` + `border` + `radius-full`, 11px weight 500
- **Accent:** `accent-light` bg + `accent-mid` border + accent text

### Callout Box
- **Style:** border + `radius-lg`, no background fill
- **Label:** 12px uppercase tertiary
- **Title:** Cormorant 22px
- **Body:** 14px secondary

### TL;DR Box
- **Style:** `bg-subtle` + border + `radius-md`
- **Label:** 10px uppercase secondary
- **Items:** 13px secondary, arrow indicators (↑ accent, → neutral)

### AI Links (Ask AI section)
- **Structure:** Section label + description + row of pill links
- **Link pill:** border + radius-full, favicon icon + label
- **Hover:** border darkens, text darkens
- **Placement:** Below hero intro, above numbers grid

### Email Modal
- **Trigger:** 8s after load, once per visitor ever (`localStorage.mg_email_modal_v1`, written on show, not on dismiss)
- **Card:** max-width 420px, `--bg` on `--border`, radius 10px, `max-height: calc(100vh - var(--sp-4) * 2)` with `overflow-y: auto`
- **Close:** 44x44 hit area, 26px glyph, `--text-tertiary` to `--text` on hover
- **Motion:** `submodal-fade` `--duration-short`, `submodal-rise` `--duration-base`, both `--ease-out`, disabled under reduced motion
- **Scrim:** `::backdrop`, never a background painted on the `<dialog>` itself. `inset: 0` only stretches a dimension whose value is `auto`, so a dialog with an explicit width and an auto height covers only its own content. Measured once at 302px of an 820px viewport, with the browser's invisible backdrop still making the rest of the page inert
- **Dark mode:** the scrim needs its own value. `rgba(15,14,12,.45)` is exactly `--bg` in dark, so it dimmed nothing. Dark uses `rgba(0,0,0,.62)`
- **Closed state:** `visibility: hidden`. This once mattered because a `display: none` subtree has no layout and the beehiiv iframe measured itself at 0. The iframe is gone, so the constraint is gone with it; the rule stays only because it is also the simpler way to keep the dialog measurable
- **Embed:** reuses `NewsletterEmbed` with `minimal`, now a native same-origin form. Nothing to defer, because there is no cross-origin document to preload
- **Scope:** every page except `/404`, which opts out with `emailModal={false}`

### Article Footer
- **Structure:** Author line + newsletter CTA (native `NewsletterEmbed` form)
- **Newsletter in footer:** Same form as homepage, provides conversion at peak engagement

## Accessibility
- **Focus styles:** `:focus-visible` with outline using accent color, 2px offset
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations
- **Contrast:** All text meets WCAG AA 4.5:1 minimum. Text-tertiary `#767676` on `#faf9f7` = 4.54:1
- **Touch targets:** Minimum 44×44px for interactive elements (navbar social icons need padding)
- **Keyboard navigation:** All interactive elements reachable via Tab, visible focus ring
- **ARIA:** Social links have `aria-label`, nav landmark present

## Dark Mode Implementation
- **Activation:** `[data-theme="dark"]` on `<html>` via localStorage (no `prefers-color-scheme` auto-detect — light is always default)
- **Toggle:** Icon-only button (☾/☀) in footer, 60% opacity, hover reveals
- **Transition:** `var(--duration-base)` ease on background, color, border-color
- **All tokens override:** bg, bg-subtle, text, text-secondary, text-tertiary, border, accent, accent-light, accent-mid
- **Navbar:** `rgba(15, 14, 12, 0.85)` with same backdrop-filter blur

## CSS Architecture
- **Single source of truth:** All tokens in `global.css :root` — no redeclaration in other files
- **article.css:** Only article-specific components (tip, callout, stat-card, etc.) — no reset, no body, no container
- **nav.css:** Navbar only, uses tokens from global.css
- **Token naming:** Colors `--text`, `--bg`, `--border`, `--accent`. Spacing `--sp-{n}`. Fonts `--font-display`, `--font-body`. Motion `--ease-out`, `--duration-{name}`.

## Newsletter Form
Own stack since 2026-08-26. beehiiv is gone: no iframe, no injected third-party scripts, no height handshake. See CLAUDE.md for the full path.

- **Component:** `NewsletterEmbed`, one implementation on 24 call sites. Native same-origin `<form>` (email input + submit) posting to `/api/subscribe`; Supabase is the source of truth and Resend the send layer
- **Shape:** input and button both `--radius-full`, per Buttons above. A hardcoded 4px shipped briefly and gave the site two different button shapes
- **Button ink:** `#1a1a1a` on `--accent`, never `--bg`. Near-white on the amber measures 2.76:1 and fails WCAG AA; dark ink passes in both themes
- **Copy:** driven by `newsletter.form.*` in `src/i18n`, never hardcoded in the component. Currently "Follow the experiments" / "When I publish a new experiment, it goes to your inbox first."
- **Errors:** `role="alert"` on the message node, and `rate_limited` shares the generic copy so the response never tells a bot how the limit is tuned
- **Without JavaScript:** the form posts natively and the route redirects to an on-demand thank-you page. A prerendered page cannot read `?ok=1`, so it could never confirm anything
- **No container fallback needed:** the form renders with the page, so there is no third-party widget to reserve height for and no layout shift to prevent
- **Placement:** both homepages, both newsletter indexes, every article footer, and inside `SubscribeModal`

## Key Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-19 | Initial design system created | Created via /design-consultation with visual research |
| 2026-03-19 | Amber accent #c4934a | Every health/founder blog uses gray or blue. Amber reads as warmth, craft, and skin — fits biomarkers content |
| 2026-03-19 | Warm dark mode #0f0e0c | Cold dark modes lose the editorial warmth. Coffee-brown dark keeps the amber popping |
| 2026-03-19 | Cormorant + DM Sans kept | Already established. No reason to change what's working. |
| 2026-03-19 | Page named /experiments not /projects | "Experiments" is more honest and interesting than "Projects" — sets the right expectation |
| 2026-03-19 | Navbar unchanged | No nav links beyond social. Keeps the minimal, personal feel. |
| 2026-03-19 | Hero weight 300 (light) | More editorial/airy than 400. Cormorant breathes at large sizes with light weight. Direction: minimal, editorial. |
| 2026-03-19 | Body 16px (not 15 or 17) | Compromise — 15px too dense, 17px too blog-like. 16px is ~70 chars/line on 620px. |
| 2026-03-19 | Keep portrait 160×240 (not avatar) | Photo creates human trust. Site is personal, not a dashboard. Avatar felt too impersonal. |
| 2026-03-19 | Text-tertiary #767676 (was #999) | WCAG AA compliance — #999 on #faf9f7 was 2.85:1, needs 4.5:1 minimum. #767676 = 4.54:1. |
| 2026-03-19 | Writing items as bordered cards | Preview style — encapsulated cards with hover bg-subtle. More structured than separator lines. |
| 2026-03-19 | Dark mode in this refonte | Tokens were specced but never implemented. Warm dark is a core design risk — ship it now. |
| 2026-03-19 | Focus + reduced-motion a11y | Zero keyboard nav and forced animations. Added :focus-visible and prefers-reduced-motion. |
| 2026-03-19 | Merge article.css duplication | article.css re-declared :root, reset, body, container. Single source of truth in global.css. |
| 2026-03-19 | Newsletter CTA in article footers | Article end was a dead-end. Peak engagement moment → Beehiiv embed for conversion. |
| 2026-03-19 | Keep "Ask AI" section, document it | Unique differentiator — no other personal site has AI prompt links. Added to Components. |
| 2026-03-20 | Numbers grid → 4 columns, health only | Removed business metrics. Single row: Bio Age, Pace of aging, RHR, VO₂Max. |
| 2026-03-20 | Dark mode: light default, no auto-detect | localStorage only, no prefers-color-scheme. Toggle icon-only (☾) in footer at 60% opacity. |
| 2026-08-25 | Email modal, once per visitor | Site had no interruptive capture. 8s delay, one showing ever, suppressed on /404. |
| 2026-08-25 | Modal closed with visibility, not display | display:none gives zero layout, so the beehiiv iframe measured 0 and the form took ~4s to appear after opening. |
| 2026-08-25 | Beehiiv iframe bounded min 47px / max 60vh | beehiiv's handshake was observed landing on 2000px (its no-measurement fallback) and on 0px. Neither is reachable now. |
| 2026-08-26 | Beehiiv embed replaced by a native same-origin form | The iframe was the root of the whole class: no measurement, no postMessage, no control over the one element the page exists for. Deleting it removed ~100 lines that existed only to compensate for it. |
| 2026-08-27 | Beehiiv fully out of the site, publication left dormant | Audit found zero beehiiv in code, CSP, env vars, DNS sending records or served HTML. The publication itself still held a live copy of the 88 subscribers, so it was closed to new signups and made private rather than deleted, to keep the pre-migration open and click history readable. |
| 2026-03-20 | DESIGN.md sync with code | Fixed drift: numbers grid cols, dark mode activation, callout box style. |
| 2026-08-26 | Accent button text `#1a1a1a`, never `#fff` | Measured: white on the amber failed WCAG AA in BOTH themes (2.76:1 light, 2.25:1 dark). Applies site-wide, every newsletter CTA was affected. |
| 2026-08-26 | beehiiv removed, signup on our own stack | The iframe is gone with the ~100 lines that existed only to tame it. `NewsletterEmbed` posts to `/api/subscribe`. The Beehiiv section above is replaced by Newsletter Signup. |
| 2026-08-26 | Mobile container padding back on the scale | `22px` horizontal and `100px` bottom were hard-coded off-scale values. Now `--sp-6` and `--sp-20`. Top stays `--sp-20` — it is navbar clearance, not slack. |
| 2026-08-26 | Text Highlight added to the system | Needed for short editorial blocks that must be scannable. Reuses `--accent-light`, no new token, capped at 3 per section. |
