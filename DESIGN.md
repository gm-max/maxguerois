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
- **Mobile padding:** 22px horizontal
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
- **Layout:** 3 columns desktop, 2 columns mobile
- **Values:** Cormorant Garamond, accent color, weight 300
- **Labels:** DM Sans 10px uppercase
- **Borders:** 1px shared borders between cells

### Stat Card (article inline)
- **Layout:** Flexible row, 1px gap trick for shared borders
- **Value:** Cormorant, accent, weight 300, centered
- **Label:** DM Sans 10px uppercase, centered

### Buttons
- **Primary:** `background: var(--text); color: var(--bg)` — hover turns accent
- **Outline:** `border: 1px solid var(--border)` — hover darkens border
- **Accent:** `background: var(--accent); color: #fff`
- **Shape:** `border-radius: var(--radius-full)`, padding 9px 20px
- **Font:** DM Sans 13px weight 500

### Tags
- **Default:** `bg-subtle` + `border` + `radius-full`, 11px weight 500
- **Accent:** `accent-light` bg + `accent-mid` border + accent text

### Callout Box
- **Style:** `bg-subtle` + border + left accent border (3px)
- **Label:** 10px uppercase accent
- **Body:** 13px secondary

### TL;DR Box
- **Style:** `bg-subtle` + border + `radius-md`
- **Label:** 10px uppercase secondary
- **Items:** 13px secondary, arrow indicators (↑ accent, → neutral)

### AI Links (Ask AI section)
- **Structure:** Section label + description + row of pill links
- **Link pill:** border + radius-full, favicon icon + label
- **Hover:** border darkens, text darkens
- **Placement:** Below hero intro, above numbers grid

### Article Footer
- **Structure:** Author line + newsletter CTA (Beehiiv embed)
- **Newsletter in footer:** Same embed as homepage, provides conversion at peak engagement

## Accessibility
- **Focus styles:** `:focus-visible` with outline using accent color, 2px offset
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all animations
- **Contrast:** All text meets WCAG AA 4.5:1 minimum. Text-tertiary `#767676` on `#faf9f7` = 4.54:1
- **Touch targets:** Minimum 44×44px for interactive elements (navbar social icons need padding)
- **Keyboard navigation:** All interactive elements reachable via Tab, visible focus ring
- **ARIA:** Social links have `aria-label`, nav landmark present

## Dark Mode Implementation
- **Activation:** `[data-theme="dark"]` on `<html>` + respects `prefers-color-scheme: dark`
- **Toggle:** Optional theme toggle button (pill style, in navbar or footer)
- **Transition:** `var(--duration-base)` ease on background, color, border-color
- **All tokens override:** bg, bg-subtle, text, text-secondary, text-tertiary, border, accent, accent-light, accent-mid
- **Navbar:** `rgba(15, 14, 12, 0.85)` with same backdrop-filter blur

## CSS Architecture
- **Single source of truth:** All tokens in `global.css :root` — no redeclaration in other files
- **article.css:** Only article-specific components (tip, callout, stat-card, etc.) — no reset, no body, no container
- **nav.css:** Navbar only, uses tokens from global.css
- **Token naming:** Colors `--text`, `--bg`, `--border`, `--accent`. Spacing `--sp-{n}`. Fonts `--font-display`, `--font-body`. Motion `--ease-out`, `--duration-{name}`.

## Beehiiv Newsletter Integration
- **Format:** Inline embed form (email input + submit button), not redirect link
- **Copy:** "Follow the experiments" / "When I publish a new experiment, it goes to your inbox first."
- **Container fallback:** `min-height: 80px` to prevent layout shift if widget takes time to load
- **Placement:** Bottom of homepage, bottom of /experiments page, **bottom of every article** (article footer CTA)

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
