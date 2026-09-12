# PA Consulting Design System

Brand: **PA Consulting** — global innovation and transformation consultancy ("We believe in the power of ingenuity to build a positive human future"). Brand line: **PA. Bringing Ingenuity to Life.**

Source: `sources/PA_Mini_Guidelines_V11.pdf` — "PA brand design guidelines, Interim version, October 2022 — V.01" (50 pp), attached by the user from local folder `PA Consulting Brand Guideline/`. Extracted text: `sources/guidelines-text.txt`. No codebase, Figma, or website source was provided — this system is built from the brand guideline only.

## Caveats/absences

- **No logo asset.** The guideline's logo pages are vector-only and could not be extracted; per policy the mark is never redrawn. Wherever a logo would sit, render "PA Consulting" (or "PA.") in plain type. Ask the brand team for SVG/PNG logo files.
- **Substituted fonts.** Real faces are commercial (CoType Foundry): Aeonik Pro → **Hanken Grotesk**, Orbikular → **Source Serif 4**, Aeonik Fono → **Fragment Mono** (Google Fonts, loaded in `tokens/fonts.css`). Swap in licensed binaries when available.
- Spacing, radii, and shadows are **derived** (guideline doesn't define them); flat, minimal, editorial defaults chosen.
- No product UI source given → no UI-kit recreations. Components are the standard set styled from the guideline's rules.

## CONTENT FUNDAMENTALS

- Voice is confident, optimistic, premium. IS: bold, insightful, authoritative, inventive, ambitious, tenacious, impactful, enduring, inclusive, fun. ISN'T: obvious, mediocre, pedestrian, arrogant, slapdash, superficial, siloed, dull.
- First-person plural "we"; addresses clients directly. Sentence case everywhere; no emoji.
- Protected phrases, verbatim only: "positive human future", "technology-driven world", "as strategies, technologies and innovation collide", "diverse teams of experts", "innovative thinking and breakthrough use of technologies", "further, faster", "enduring results".
- Brand line usage: in running text write "bringing ingenuity to life" in sentence case, unhighlighted. As a sign-off: own line, bold, title case, with "PA." before and full stop after → **PA. Bringing Ingenuity to Life.**
- Purpose statement (use sparingly): "We believe in the power of ingenuity to build a positive human future."
- Example cadence: short declaratives, em-dash-free, momentum words ("further, faster", "opportunity from complexity").

## VISUAL FOUNDATIONS

- **Colour.** Core: Dark Blue #00172D (dominant text/background), White, PA Ingenuity Red #F62B44 (logo/accents ONLY — links & buttons MUST use accessible red #EA0027), Logo Grey #7C8B9A, Greys 01–04, Aquas 01–05. Supporting (photo backgrounds, infographics only): Lime, Rose, Apricot 01–04. Semantic: Success #008471, Warning #FF6C3B, Error #CC1D63 (progress indicators + alerts only).
- **Backgrounds.** Four sanctioned surfaces: White, Grey 01 (#E8ECF2), Grey 04 (#36465A), Dark Blue (#00172D). Aqua 01 is a highlight surface (type on it is always Aqua 05). No gradients, no textures, no patterns — flat editorial fields and photography.
- **Type.** Three families: Aeonik Pro (primary — headlines 400, subheads 450, captions 550/400, buttons 450), Orbikular serif (companion — body 400, pull quotes 550, card titles 550, links 400), Aeonik Fono mono (ancillary — crossheads/tags/numerals/annotations, 400 only, uppercase + letterspaced for crossheads). Sizes follow the Bringhurst scale (6–253). Headlines are REGULAR weight, large, Dark Blue; second-level headlines Grey 03.
- **Type colour by background.** White bg: headings Dark Blue, secondary Grey 03, links #EA0027. Grey 01 bg: secondary becomes Grey 04. Dark Blue bg: type White, secondary Grey 02, links Ingenuity Red. Grey 04 bg: type Grey 01, secondary Grey 02. Aqua 01 bg: everything Aqua 05.
- **Layout.** Generous whitespace, strong left-aligned editorial grids, big regular-weight headlines, mono crossheads as section markers. Premium, restrained, no ornament.
- **Cards** (derived): white surface, 1px Grey 01 border or soft dark-blue-tinted shadow, 2–4px radius, serif 550 titles (Orbikular style, may be Aqua 05).
- **Motion/hover** (derived, unspecified): keep minimal — opacity/color shifts, \~150ms ease; no bounces.
- Imagery: photography with cool, blue-leaning grade; supporting palette used as photo background fields.

## ICONOGRAPHY

- The guideline defines **no icon system** and contains no icon assets. No emoji. Numerals/annotations are set in Aeonik Fono — mono type does the "labelling" work icons would.
- Where icons are unavoidable, use **Lucide** via CDN at 1.5px stroke, coloured Dark Blue / Grey 03 (SUBSTITUTION — flag to brand team). Prefer type-first solutions.
- No logo files exist in this project (see Caveats). Never draw the PA mark.

## Index

- `styles.css` → `tokens/` (colours, typography, spacing, fonts)
- `guidelines/` — specimen cards (Design System tab)
- `components/forms|display|feedback|navigation/` — Button, IconButton, Input, Select, Checkbox, Radio, Switch, Card, Badge, Tag, Tooltip, Alert, Toast, Dialog, Progress, Tabs (standard set — no source inventory existed; styled strictly from the guideline)
- `slides/` — sample slide layouts recreated from the guideline's Examples section (pp. 46–49)
- `sources/` — original PDF + extracted text
- `SKILL.md` — agent skill entry point

### Intentional additions

- `Alert`, `Progress` — the guideline explicitly shows semantic alert + progress-indicator examples (p. 34).
- Standard form/overlay primitives (Button…Dialog) — authored because no source defined a component inventory; styled from guideline type/color rules.
