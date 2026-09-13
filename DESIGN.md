---
name: NewCo Community
description: A practitioner-led forum for UK government leaders building NewCo-style delivery organisations, convened by PA Consulting.
colors:
  dark-blue: "#00172D"
  white: "#FFFFFF"
  ingenuity-red: "#F62B44"
  red-accessible: "#EA0027"
  red-accessible-hover: "#C40021"
  logo-grey: "#7C8B9A"
  grey-01: "#E8ECF2"
  grey-02: "#A2B3C9"
  grey-03: "#64778A"
  grey-04: "#36465A"
  aqua-01: "#CDECF2"
  aqua-02: "#B7E5EE"
  aqua-03: "#4AB9D3"
  aqua-04: "#0580A7"
  aqua-05: "#024D78"
  lime-01: "#D5ECC8"
  lime-02: "#C0EFA5"
  lime-03: "#6CBD3A"
  lime-04: "#2C8027"
  rose-01: "#F3D3DC"
  rose-02: "#FFBECF"
  rose-03: "#F3809E"
  rose-04: "#EE2F66"
  apricot-01: "#FAECBD"
  apricot-02: "#FFE18E"
  apricot-03: "#FFC000"
  apricot-04: "#EBAE00"
  success: "#008471"
  warning: "#FF6C3B"
  error: "#CC1D63"
typography:
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(34px, 6.4vw, 63px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 400
    lineHeight: 1.1
  subheading:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 450
    lineHeight: 1.3
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  pullquote:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "32px"
    fontWeight: 550
    lineHeight: 1.3
  caption:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 550
    lineHeight: 1.4
  button:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 450
    lineHeight: 1
  crosshead:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.08em"
  tag:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
rounded:
  sm: "2px"
  md: "4px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
  9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.red-accessible}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.red-accessible-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.red-accessible}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.red-accessible}"
    typography: "{typography.button}"
    padding: "11px 20px"
  button-dark:
    backgroundColor: "{colors.dark-blue}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  card-border:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "20px 22px"
  card-shadow:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "20px 22px"
  card-dark:
    backgroundColor: "{colors.dark-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "20px 22px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.dark-blue}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  badge-neutral:
    backgroundColor: "{colors.grey-01}"
    textColor: "{colors.grey-04}"
    rounded: "{rounded.sm}"
    padding: "5px 9px"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.dark-blue}"
    typography: "{typography.tag}"
    padding: "7px 11px"
---

# Design System: NewCo Community

## Overview

**Creative North Star: "The Briefing Room"**

This is the visual language of a room where senior people compare notes candidly — not a marketing stage. Every surface stays flat and restrained: white, near-black "Dark Blue," and a handful of governed greys and aquas, with a single accessible red spent sparingly on links, primary actions, and nothing else. Headlines are large but regular-weight, never bold — confidence that doesn't need to shout. Type does the labelling work icons would elsewhere: a monospace "crosshead" (uppercase, letterspaced) marks sections and tags, a serif carries body copy and pull quotes with an editorial, unhurried cadence, and a grotesque sans handles headlines, subheads, and UI chrome.

This is a governed corporate brand system (PA Consulting's own guidelines), not an invented aesthetic — the palette, roles, and voice below are fixed brand fact, not stylistic license. Spacing, radii, and shadows are the one genuinely derived layer (the guideline doesn't specify them): a 4px-based scale and a near-flat, editorial default of 2–4px radii and two soft, cool-toned shadow steps.

**Key Characteristics:**
- Flat, editorial fields only — no gradients, no textures, no patterns.
- One accent color (accessible red) used rarely and specifically: links and primary buttons only.
- Regular-weight (400) display and headline type at large sizes; weight goes up only for emphasis roles (subheads 450, pull quotes and captions 550), never for headlines.
- Monospace crossheads/tags/numerals do the structural labelling other systems give to icons.
- Left-aligned, generously spaced layout; a single 1240px content container throughout.

## Colors

The palette is small, cool, and strictly role-gated: four sanctioned page backgrounds, one link/button red, and semantic colors reserved for alerts and progress only.

### Primary
- **Dark Blue** (#00172D): dominant text color on white/light surfaces; also one of the four sanctioned page backgrounds (dark sections, footer, header).
- **Red Accessible** (#EA0027): the only interactive accent — every link, every primary button, focus rings. This is the accessibility-mandated red; "Ingenuity Red" below is reserved for the logo and must never substitute for it in UI.
- **Red Accessible Hover** (#C40021): the one hover/darken state derived from Red Accessible, used identically on primary buttons and text links.

### Secondary
- **Ingenuity Red** (#F62B44): logo and brand-accent use only — never links, never buttons. Keeping it out of UI is what keeps Red Accessible legible as "the" interactive color.
- **Aqua 01–05** (#CDECF2 → #024D78): a five-step aqua ramp. Aqua 01 is a sanctioned highlight *surface* (any text on it renders in Aqua 05, never Dark Blue); Aqua 04/05 also appear as focus-outline and on-highlight text colors.

### Tertiary (supporting palette — photo backgrounds and infographics only)
- **Lime 01–04** (#D5ECC8 → #2C8027)
- **Rose 01–04** (#F3D3DC → #EE2F66)
- **Apricot 01–04** (#FAECBD → #EBAE00)

These three ramps exist for photography backgrounds and infographic/data-viz fields. They have not appeared in the current build's UI chrome, and the guideline is explicit that they don't belong there.

### Neutral
- **White** (#FFFFFF): default page/card background; one of the four sanctioned backgrounds.
- **Grey 01** (#E8ECF2): sanctioned subtle-surface background; also the default card border and Badge neutral background.
- **Grey 02** (#A2B3C9): default input border; secondary text on Dark Blue backgrounds.
- **Grey 03** (#64778A): secondary/caption text on white and Grey 01 backgrounds.
- **Grey 04** (#36465A): the fourth sanctioned page background (a dark-but-not-black surface); Badge neutral text.
- **Logo Grey** (#7C8B9A): reserved for the wordmark rendering only.

### Semantic
- **Success** (#008471), **Warning** (#FF6C3B), **Error** (#CC1D63): progress indicators and alerts only — not decorative, not for arbitrary status chips.

### Named Rules
**The One Red Rule — with a measured exception.** Red Accessible (#EA0027) is the interactive-accent color on light surfaces (White, Grey 01): 4.64:1 against white, comfortably AA. On Dark Blue it measures **3.90:1 — it fails WCAG's 4.5:1 text-contrast requirement** and must not be used for link/button *text* there. On Dark Blue, use Ingenuity Red (#F62B44, 4.61:1) for link text instead — this is what the source brand guideline itself specifies ("Dark Blue bg: links Ingenuity Red") and it is the only reading of "Ingenuity Red is logo-only" that also passes contrast math. Ingenuity Red still never appears as a *background fill* (buttons, badges) — only as text on Dark Blue.

**The Four Surfaces Rule.** Every screen is built from exactly four background options: White, Grey 01, Grey 04, or Dark Blue. A fifth background is not a variation, it's a violation. Aqua 01 is the sole exception, and only as a highlight field with Aqua 05 text.

**The Verified-Pair Rule (WCAG 2.2 AA).** Every text/background pairing below is measured, not assumed:
- Dark Blue on White / White on Dark Blue: 18.10:1 ✅
- Grey 03 (secondary text) on White: 4.62:1 ✅ (passes, but with almost no margin — treat as the floor, not a safe default to darken further)
- Grey 03 on **Grey 01**: 3.89:1 ❌ — fails 4.5:1. On a Grey 01 background, secondary text must switch to **Grey 04** (8.12:1 ✅), exactly as the brand guideline's own "type colour by background" table specifies. Any component still rendering Grey 03 secondary text on a Grey 01 card/surface is non-compliant.
- Grey 02 on Dark Blue: 8.47:1 ✅ · Grey 01 on Grey 04: 8.12:1 ✅ · Grey 02 on Grey 04: 4.51:1 ✅ (passes by 0.01 — fragile; don't shift either color without re-checking)
- Aqua 05 on Aqua 01 (the sanctioned highlight surface): 7.23:1 ✅
- White on Red Accessible (primary button fill): 4.64:1 ✅ · White on its hover state #C40021: 6.23:1 ✅
- White on Dark Blue (dark button fill): 18.10:1 ✅
- Error (#CC1D63) as text on white: 5.35:1 ✅ · Success (#008471) as a filled background with white text: 4.63:1 ✅
- **Warning (#FF6C3B) as a filled background with white text: 2.81:1 ❌** — fails badly. This exact pairing exists today in the Badge and Progress "warning" tones (see Components → Badges and Do's and Don'ts). Don't put white text directly on Warning; use Warning as a small non-text indicator (dot, bar) with Dark Blue text alongside, the way Alert already does it.
- Input border (Grey 02 on White): 2.14:1 ❌ — fails the 3:1 non-text-contrast requirement (WCAG 1.4.11) for a UI component boundary that's the primary cue for the field's shape. Card border (Grey 01 on White, 1.19:1) is exempt: it's decorative separation, not the sole cue to a functional boundary.

## Typography

**Display/Headline/UI Font:** Hanken Grotesk (substituting the licensed Aeonik Pro), with system-ui, sans-serif fallback.
**Body/Companion Font:** Source Serif 4 (substituting the licensed Orbikular), with Georgia, serif fallback.
**Ancillary/Mono Font:** Fragment Mono (substituting the licensed Aeonik Fono), with ui-monospace, monospace fallback.

**Character:** A regular-weight grotesque carries structure (headlines, nav, buttons) while a serif carries reading (body, quotes, card titles) — the pairing reads as premium editorial rather than software-UI. A monospace third voice handles anything that is really a label, not prose.

### Hierarchy
- **Display** (400, clamp(34px, 6.4vw, 63px), 1.08 line-height, -0.015em tracking): hero headlines only, white text on Dark Blue.
- **Headline** (400, 48px, 1.1): section and page-level headings; Dark Blue on light backgrounds.
- **Subheading** (450, 24px, 1.3): second-level headings.
- **Body** (400, 16px, 1.6, serif): running copy; roughly 65–75ch measure in practice.
- **Pullquote** (550, 32px, 1.3, serif): testimonial and pull-quote emphasis.
- **Caption** (550, 14px, 1.4, sans): card titles, small emphasis labels.
- **Button** (450, 16px, 1): all button labels.
- **Crosshead** (400, 14px, 1, mono, 0.08em tracking, **uppercase**): section markers — the mono voice doing the job icons would do elsewhere.
- **Tag** (400, 12px, 1, mono): tags, numerals, page furniture.

### Named Rules
**The Regular-Weight Headline Rule.** Headlines and display type are always weight 400. Bold is never used for size-based emphasis — emphasis comes from scale and color, not weight. Weight only climbs for smaller supporting roles (subheading 450, pullquote/caption 550).

## Layout

A single content container (max-width: 1240px) with responsive side padding (clamp(20px, 5vw, 48px)) is used site-wide, nested narrower measures (720/640/620/560px) inside it for prose blocks and headline max-widths. Vertical section rhythm is driven by clamp-based padding (typically clamp(40–48px, 6–7.5vw, 64–88px) top/bottom), so density eases on small screens without a breakpoint jump. Card/feature grids use `repeat(auto-fit, minmax(min(100%, 280–320px), 1fr))` — a single responsive grid pattern reused across the events, guidance-by-stage, and community sections rather than bespoke breakpoints per section. Layout is left-aligned throughout; nothing centers as a default.

## Elevation & Depth

Flat by default. Most surfaces (cards, nav, header) rely on a hairline Grey 01 border or a sanctioned background change, not a shadow, to separate from the page. Two shadow tokens exist for the surfaces that do lift: a soft ambient card shadow and a stronger overlay shadow for anything that floats above the page (dialogs, popovers).

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 3px rgba(0,23,45,.08), 0 4px 14px rgba(0,23,45,.06)`): the optional "shadow" Card variant, used instead of a border when a card needs to visually separate from a busy or colored background.
- **Overlay** (`box-shadow: 0 8px 40px rgba(0,23,45,.18)`): dialogs and other floating surfaces.

### Named Rules
**The Border-Before-Shadow Rule.** Reach for a 1px Grey 01 border first. A shadow is a deliberate lift for something that floats above the page (a dialog) or sits on a busy field — not a default card treatment.

## Shapes

Radius is minimal and binary: 2px (`--radius-sm`) for nearly everything interactive or contained (buttons, inputs, badges, the default bordered card), 4px (`--radius-md`) only for the shadow-variant card. Tags are the one deliberate exception — square corners, no radius at all, which visually distinguishes a "label" (tag) from a "control" (button/badge). Borders are always 1px and always a governed grey or the semantic accent (never a mid-tone invented for one component).

### Named Rules
**The Sharp Tag Rule.** Tags never take a radius, even though every other small surface (badges, buttons, inputs) uses `radius-sm`. The squared corner is what reads as "label" rather than "control."

## Components

### Buttons
- **Shape:** 2px radius (`--radius-sm`), 1px transparent border reserved for the variants that need a visible outline.
- **Primary:** Red Accessible background, white text, darkens to #C40021 on hover. Padding scales by size: sm `8px 14px`/14px type, md `11px 20px`/16px type, lg `14px 26px`/18px type.
- **Secondary:** transparent background, Red Accessible text and border; fills to a 6%-opacity red wash on hover.
- **Ghost:** transparent, no border, Red Accessible text that darkens on hover — for the lowest-emphasis actions (e.g. inline "Download ↓").
- **Dark:** Dark Blue background (for use on light surfaces where a button needs more weight than Secondary/Ghost but isn't the primary action), white text, darkens toward #0B2A47 on hover.
- **Disabled:** any variant at 45% opacity, default cursor.

### Tags
- **Style:** transparent background, 1px Grey 02 border (Grey 03 on dark surfaces), Dark Blue text (white on dark), mono type, square corners (no radius — see Shapes).
- **Removable:** an optional trailing "×" in Grey 03, clickable.

### Badges
- **Style:** 2px radius, mono caption type, no border — color communicates tone directly (neutral Grey 01/Grey 04, info Aqua 01/Aqua 05, success/error on their semantic color with white text).
- **Known defect — warning tone:** the current component renders white text on Warning (#FF6C3B), 2.81:1 — fails WCAG 1.4.3. Fix by giving the warning tone Dark Blue text (Dark Blue on #FF6C3B = 6.43:1) instead of white, matching how Alert already treats warning (colored indicator + Dark Blue body text).

### Cards
- **Corner Style:** 2px radius by default; 4px on the shadow variant.
- **Background:** white (Dark Blue for the `dark` variant).
- **Border/Shadow Strategy:** 1px Grey 01 border by default; the `shadow` variant swaps the border for the Card shadow token (see Elevation & Depth) instead of stacking both.
- **Internal Padding:** `20px 22px` throughout, regardless of variant.
- **Anatomy:** optional mono, uppercase, letterspaced eyebrow (Grey 03, or Grey 02 on dark) → serif 550 title (Aqua 05, or white on dark) → serif 400 body copy → optional footer slot.

### Inputs
- **Style:** white background (Grey 01 when disabled), 1px Grey 02 border, 2px radius, serif body type at 16px.
- **Focus:** outline color shifts to Aqua 04.
- **Error:** border and helper text switch to the semantic Error color; helper text renders below the field either way (error message replaces the hint, never both at once).

### Navigation
- Sticky header, Dark Blue background, hairline white-8%-opacity bottom border. Nav labels use the sans Button-style type; the active item is marked by weight/color/underline state passed per item rather than a fixed active-state token — treat that as a page-level concern, not a component invariant.

## Do's and Don'ts

### Do:
- **Do** keep Red Accessible (#EA0027) as the only interactive color — links, primary buttons, focus rings, nothing else.
- **Do** default every card to a 1px Grey 01 border; reach for the shadow variant only when a card needs to separate from a busy or non-white field.
- **Do** keep headlines and display type at weight 400; use scale and color for emphasis, not bold.
- **Do** build every layout from the same four sanctioned backgrounds (White, Grey 01, Grey 04, Dark Blue), with Aqua 01 reserved as the one highlight-surface exception (always paired with Aqua 05 text).
- **Do** use the mono crosshead/tag voice (uppercase, 0.08em tracking) for section markers and labels instead of introducing icons.

### Don't:
- **Don't** use Red Accessible for link/button *text* on a Dark Blue background — it measures 3.90:1 there and fails AA. Use Ingenuity Red for that one context instead (see The One Red Rule — with a measured exception); Ingenuity Red still never becomes a background fill.
- **Don't** use the supporting palette (Lime/Rose/Apricot) for interface chrome — it exists for photography backgrounds and infographics only.
- **Don't** round a Tag's corners to match Buttons/Badges — the square corner is the deliberate signal that distinguishes a label from a control.
- **Don't** add gradients, textures, or decorative patterns to any surface — the brand guideline is explicitly flat/editorial.
- **Don't** set a literal `font-size` after a type-role shorthand on the same element — one hero headline in the current build (`font: 400 clamp(34px,6.4vw,63px)/1.08 ...; font-size: 80px`) has a stray longhand override that silently wins over the intended clamp; besides breaking the intended scale, a fixed 80px headline defeats reflow/zoom behavior (WCAG 1.4.10) on narrow or zoomed viewports. Treat it as a bug to fix on sight, not a pattern to repeat.
- **Don't** leave Grey 03 as "secondary text" on a Grey 01 surface (3.89:1, fails) — switch to Grey 04 (8.12:1) the moment secondary text sits on Grey 01, per the brand guideline's own background-conditional text rule.
- **Don't** rely on the Input component's current border color (Grey 02 on white = 2.14:1) as the sole cue to the field's boundary — it fails the 3:1 non-text-contrast minimum (WCAG 1.4.11). Darken the default border (Grey 03 or darker reaches 3:1+) or pair it with a subtle background tint.
- **Don't** ship the Badge "warning" tone as white-on-#FF6C3B (2.81:1, fails) — see Components → Badges for the fix.
- **Don't** leave an interactive control (e.g. the Tag component's `onRemove` "×") without explicit hit-area padding — as implemented it has no minimum size set and likely renders under the 24×24px target-size minimum (WCAG 2.2 SC 2.5.8). Give it at least 24×24px of padding/hit-area even though the visible glyph stays small.
