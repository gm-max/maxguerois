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
- **Display/Hero:** Cormorant Garamond — elegant, editorial, confident. Carries the headline weight without being loud.
- **Body:** DM Sans — modern, readable, unpretentious. Pairs naturally with Cormorant.
- **UI/Labels:** DM Sans — same as body, weight 500, uppercase tracking for section labels
- **Data/Tables:** DM Sans with tabular-nums — clean, aligned, scannable
- **Code:** inherit (no code blocks in this site)
- **Loading:** Google Fonts — `Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500` + `DM+Sans:ital,wght@0,300;0,400;0,500;1,400`
- **Scale:**
  - Hero: 2.8rem / line-height 1.15 / letter-spacing -0.02em
  - H1 (article): 2.6rem / line-height 1.15 / letter-spacing -0.02em
  - H2 (section): 1.5–1.8rem / line-height 1.2
  - Body: 1rem (17px base) / line-height 1.65–1.75
  - Label: 0.7rem / weight 500 / uppercase / tracking 0.12em
  - Caption: 0.72–0.78rem / color tertiary

## Color

### Approach
Restrained. One warm accent + neutrals. Color is rare and meaningful. Amber is used only for display numbers, key hover states, and CTAs — never decoration.

### Light Mode
- **Background:** `#faf9f7` — warm off-white, not stark
- **Background subtle:** `#f4f2ee` — hover states, table headers, subtle cards
- **Text:** `#1a1a1a` — near-black, warm
- **Text secondary:** `#6b6b6b` — body paragraphs, descriptions
- **Text tertiary:** `#999999` — dates, captions, metadata
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
- **Section gap:** 80px between major sections
- **Container padding:** 80px top/bottom, 24px horizontal

## Layout
- **Approach:** Grid-disciplined — strict single column, 620px max-width
- **Max content width:** 620px
- **Mobile padding:** 22px horizontal
- **Border radius scale:** sm:8px · md:10px · lg:12px · full:100px
- **Navbar:** Fixed, 52px height, frosted glass `backdrop-filter: blur(12px)`

## Motion
- **Approach:** Minimal-functional — only entrance animations and hover microinteractions
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for enters (spring-like)
- **Entry animation:** `fadeUp` — `opacity: 0→1, translateY: 12px→0, 600ms`
- **Stagger:** 80ms delay per sibling
- **Hover:** 150ms ease — color, border-color, transform
- **Theme switch:** 300ms ease on background, color, border-color

## Beehiiv Newsletter Integration
- **Format:** Inline embed form (email input + submit button), not redirect link
- **Copy:** "Follow the experiments" / "When I publish a new experiment, it goes to your inbox first."
- **Container fallback:** `min-height: 80px` to prevent layout shift if widget takes time to load
- **Placement:** Bottom of homepage (after sections), bottom of /experiments page

## Key Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-19 | Initial design system created | Created via /design-consultation with visual research |
| 2026-03-19 | Amber accent #c4934a | Every health/founder blog uses gray or blue. Amber reads as warmth, craft, and skin — fits biomarkers content |
| 2026-03-19 | Warm dark mode #0f0e0c | Cold dark modes lose the editorial warmth. Coffee-brown dark keeps the amber popping |
| 2026-03-19 | Cormorant + DM Sans kept | Already established. No reason to change what's working. |
| 2026-03-19 | Page named /experiments not /projects | "Experiments" is more honest and interesting than "Projects" — sets the right expectation |
| 2026-03-19 | Navbar unchanged | No nav links beyond social. Keeps the minimal, personal feel. |
