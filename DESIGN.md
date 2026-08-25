---
name: The Softube Field Guide
description: An independent, job-first catalog reference built as a signal-path field manual.
colors:
  black: "#050505"
  black-soft: "#111312"
  graphite: "#2b2f2d"
  graphite-muted: "#5b625e"
  mist: "#e8ebe9"
  mist-soft: "#f4f6f5"
  white: "#ffffff"
  mint: "#00c795"
  mint-dark: "#007f61"
  mint-wash: "#e6f8f2"
  line-dark: "#303431"
  line-light: "#d7dcda"
  control-dark: "#171918"
  control-dark-focus: "#1b1e1c"
  control-line: "#4a504c"
  mint-detail-line: "#cce8df"
  lineage-unlicensed: "#2875be"
  error: "#b42318"
  scrim: "rgba(5, 5, 5, .64)"
typography:
  display:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "clamp(56px, 6.6vw, 96px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "clamp(34px, 4vw, 58px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "clamp(22px, 2.4vw, 32px)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  entry-title:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.18
  body:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.48
  control:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
  label:
    fontFamily: '"Outfit", "Avenir Next", "Helvetica Neue", sans-serif'
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.38
    letterSpacing: "0.045em"
rounded:
  square: "0"
  compact: "7px"
  skip-link: "8px"
  control: "10px"
  surface: "12px"
  round: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  frame: "clamp(34px, 3vw, 52px)"
components:
  masthead-search:
    backgroundColor: "{colors.control-dark}"
    textColor: "{colors.white}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 66px 0 44px"
    height: "42px"
  masthead-search-focus:
    backgroundColor: "{colors.control-dark-focus}"
    textColor: "{colors.white}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 66px 0 44px"
    height: "42px"
  job-link:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.entry-title}"
    rounded: "{rounded.square}"
    height: "54px"
  plugin-summary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black-soft}"
    typography: "{typography.entry-title}"
    rounded: "{rounded.square}"
    padding: "13px 8px"
    height: "68px"
  plugin-summary-hover:
    backgroundColor: "{colors.mist-soft}"
    textColor: "{colors.black-soft}"
    typography: "{typography.entry-title}"
    rounded: "{rounded.square}"
    padding: "13px 8px"
    height: "68px"
  plugin-detail:
    backgroundColor: "{colors.mint-wash}"
    textColor: "{colors.graphite}"
    typography: "{typography.body-small}"
    rounded: "{rounded.square}"
    padding: "18px 20px"
  product-media-strip:
    backgroundColor: "{colors.mist-soft}"
    textColor: "{colors.graphite}"
    typography: "{typography.body-small}"
    rounded: "{rounded.square}"
    padding: "16px 22px 16px 16px"
  drawer:
    backgroundColor: "{colors.black-soft}"
    textColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "22px 24px 30px"
    width: "min(390px, 92vw)"
  clear-search:
    backgroundColor: "transparent"
    textColor: "{colors.mint-dark}"
    typography: "{typography.control}"
    rounded: "{rounded.compact}"
    padding: "6px 10px"
---

# Design System: The Softube Field Guide

## Overview

**Creative North Star: "The Signal-Path Field Manual"**

The guide feels like independent reference material laid out on a modern equipment bench. Matte-black orientation fields carry the masthead, search, production jobs, and category wayfinding. They then resolve decisively into a white reading canvas, where thin graphite rules and mint signal marks organize a large body of research without turning it into a wall of cards.

This is a high-craft category-standard interface, not a novel interaction metaphor and not a storefront. The visual system borrows the clarity and precision producers expect from audio software while keeping its editorial independence explicit. Density is compact in controls and catalog rows, generous around major reading transitions, and progressive inside native disclosures.

`styles.css`, loaded after the embedded styles in `index.html`, is the implemented visual authority. The warm paper, red, orange, gold, blurred masthead, pill search, raised card, and persistent desktop-sidebar declarations in the embedded predecessor stylesheet are not part of the finished system. `app.js` supplies the progressive-enhancement structure and states described below; source research remains readable without that enhancement.

**Key Characteristics:**

- Matte-black equipment fields resolving into a white reading canvas.
- Mint used as a signal, active-state, focus, and recommendation color—not as broad decoration.
- One geometric sans family across display, reading, data, and controls.
- Square structural regions, fine rules, compact rounded controls, and almost no elevation.
- Job-first orientation followed by progressively disclosed complete catalog coverage.
- One coherent authored monoline SVG icon language.

**The Independence Rule.** Every public expression must read as an independent editorial reference. Use the typographic field-guide wordmark and explicit disclosure; never imply an official Softube property or use an official logo.

**The Progressive Reference Rule.** Preserve complete information, but let hierarchy, search, categories, and disclosures reveal it in usable layers. Completeness is not permission for an undifferentiated catalog dump.

## Colors

The palette is near-monochrome equipment black and paper white, with mint acting like a live signal path. Neutral differences should be subtle enough to preserve reading calm while still distinguishing text, rules, hover surfaces, and controls.

### Primary

- **Signal Mint** (`mint`): Active indicators, authored signal marks, focused borders, selection, filled official-partnership lineage dots, and the one-load wordmark sweep.
- **Grounded Mint** (`mint-dark`): Links and recommendation text on light surfaces, section numbers, counts, and labels that need reliable contrast against white.
- **Signal Wash** (`mint-wash`): Expanded catalog-entry data and active search feedback. Use it for informative disclosure, not as a generic panel fill.
- **Signal Divider** (`mint-detail-line`): Internal rules within mint-wash entry bodies.

### Secondary

- **Research Blue** (`lineage-unlicensed`): Dashed unlicensed-identification indicators only. It communicates evidence status and must not become a second general accent.
- **Fault Red** (`error`): Empty-search and true error communication only.

### Neutral

- **Equipment Black** (`black`): Page ground, masthead, hero, category rail, and footer.
- **Soft Equipment Black** (`black-soft`): Primary text on white and the navigation drawer surface.
- **Graphite** (`graphite`): Secondary body copy with strong legibility.
- **Muted Graphite** (`graphite-muted`): Supporting descriptions, metadata, icons, counts, and ringed Softube-original lineage indicators.
- **Paper White** (`white`): Reading canvas, catalog rows, and light content surfaces.
- **Mist** (`mist`): Reserved light neutral in the implemented palette.
- **Soft Mist** (`mist-soft`): Quiet row hover, alternating table bands, methodology surfaces, and blockquotes.
- **Dark Equipment Rule** (`line-dark`): Dividers inside black regions.
- **Light Graphite Rule** (`line-light`): Dividers across the white reading canvas.
- **Control Black / Focus Black / Control Line** (`control-dark`, `control-dark-focus`, `control-line`): The masthead search field at rest, on focus, and at its boundary.
- **Drawer Scrim** (`scrim`): Modal separation behind the open navigation drawer.

**The One Signal Rule.** Mint is the only general accent. Blue and red are semantic exceptions; do not add decorative accent colors or restore the predecessor's red-orange-gold palette.

**The Field Transition Rule.** Orientation and navigation live on equipment black; sustained reading lives on paper white. Avoid intermediate decorative backgrounds that weaken this clear transition.

## Typography

**Display Font:** Outfit, with Avenir Next and Helvetica Neue fallbacks
**Body Font:** Outfit, with Avenir Next and Helvetica Neue fallbacks
**Label Font:** Outfit, with the same fallbacks

**Character:** Outfit supplies the slightly compressed, geometric silhouette of contemporary audio software without sacrificing long-form readability. The system creates hierarchy through scale, weight, spacing, and case rather than mixing typefaces; no interface text uses a weight below 400.

### Hierarchy

- **Display** (`display`): The opening field-guide title only. Keep it bold, tightly tracked, balanced, and short enough to remain a decisive shape.
- **Headline** (`headline`): Major secondary reading section titles. Cap line length around 24 characters where the current layouts do so.
- **Title** (`title`): Catalog-category disclosures. Section numbers use tabular numerals and grounded mint.
- **Entry title** (`entry-title`): Production-job links and catalog record names. It must remain more prominent than lineage metadata.
- **Body** (`body`): Default prose. Explanatory leads generally stay within 65–82 characters per line depending on context; sustained research copy should not span the full canvas.
- **Small body** (`body-small`): Catalog detail fields, recipes, tables, and compact instructional text.
- **Control** (`control`): Search, navigation, counts, and compact actions.
- **Label** (`label`): Uppercase eyebrows, lineage metadata, field names, and table headings. Use restrained tracking and short phrases only.

**The One-Family Rule.** Do not introduce display serifs, condensed novelty faces, monospaced metadata, or a second sans family. The hierarchy is already encoded in the Outfit scale.

**The Evidence-Order Rule.** Record name first, lineage second, practical fields third. On narrow screens, move lineage into the opened body rather than shrinking it into unreadability.

## Layout

The site uses broad page-scale fields constrained to a centered maximum width of 1440px. The sticky masthead is 68px high on larger screens, followed by a sticky category rail; their combined offset informs deep-link positioning. The black opening composition is a two-column grid pairing the title and promise with five production-job links. The white reading canvas then begins with a full-width decision map and compact method strip before settling into full-width catalog disclosures and lower-priority reference sections.

Desktop frame padding scales from 34px to 52px for the masthead, category rail, reading canvas, and footer, while the 1440px ceiling preserves visible outer breathing room on wide displays. The opening field uses a wider 70px inset and a deliberately large flexible column gap. The catalog is a ruled one-column index, not a multi-column card wall. Expanded record content uses four equal data columns, while recipes may use a three-column grid. Tables are allowed their own horizontal scroller; the page itself must never overflow horizontally.

Responsive behavior is content-led at three implemented breakpoints:

- **1120px:** Signal selectors become a three-column control bank and the “All routes” view becomes one lane wide; method items become two columns; expanded catalog data changes from four columns to two.
- **820px:** The masthead becomes a menu/search control bar, the wordmark hides, the hero stacks, the category rail becomes horizontally scrollable, the rail stops sticking, and the reading inset reduces to 20px.
- **600px:** Catalog counts and summary-line lineage hide; lineage reappears as the first field inside the expanded record. Record data, recipe stages, guidance, method lists, and decision lanes become single-column without losing direct plugin or comparison links.

Search is a focused catalog mode: while a query is active, the hero, category rail, primer, methodology disclosure, and secondary reading leave the visual flow so matches become the whole task. Matching catalog sections open, counts update live, and clearing search restores the desktop/mobile default-open policy.

Print is a complete research-document mode. Interactive chrome is removed, all disclosure content is made visible, catalog and reference sections begin on new pages, and individual records avoid page breaks where possible.

**The No-Lost-Context Rule.** At every width, retain the search, category path, record name, lineage, and practical fields. Reflow or relocate metadata; never discard it.

**The Controlled-Overflow Rule.** Only the category rail and data tables may scroll horizontally. Any other horizontal overflow is a regression.

## Elevation & Depth

The page structure is flat. Black/white field changes, 1px rules, type scale, whitespace, mint washes, and disclosure state establish depth; cards and page sections do not lift at rest or on hover. The navigation drawer is the principal elevated layer, using a soft rightward shadow (`18px 0 46px rgba(0, 0, 0, .28)`) over the drawer scrim. The floating back-to-top utility is a small affordance exception with a compact downward shadow (`0 9px 24px rgba(0, 0, 0, .2)`).

**The Flat-Structure Rule.** Never add shadows, glass effects, blur, gradients, or hover lift to the masthead, hero, category rail, reading canvas, catalog sections, record rows, tables, recipes, or methodology surfaces.

**The Utility-Elevation Rule.** Elevation is reserved for an overlay that must separate from the document or a floating viewport control. Do not use it as generic emphasis.

## Shapes

Structural regions are square: the masthead, hero, category rail, reading canvas, catalog sections, record rows, recipes, and footer. Rounded geometry belongs to compact inputs, feedback surfaces, bounded informational disclosures, and utility controls. The recurring surface radius is 12px; the masthead search and search summary use 10px; the compact clear action uses 7px. Circles are reserved for lineage indicators and the floating back-to-top control.

Rules are equipment-like and precise: 1px graphite separators organize both black and white fields, while a 2px mint line marks the active catalog area. Keyboard focus is more emphatic: a 3px mint outline with a 3px offset. Do not confuse the focus outline with a decorative border.

Icons are authored SVG symbols with 1.5px monoline strokes, round caps, and round joins. They inherit current color and stay visually subordinate to text. Use the existing icon grammar for production jobs, catalog areas, navigation, disclosure, and method cues; do not mix it with Unicode glyphs, emoji, filled icon packs, or a differently weighted library.

**The Square-Field Rule.** Page-scale containers and catalog rows remain square. A radius is a local affordance, not a default container treatment.

**The One-Stroke Rule.** New icons must match the existing 1.5px authored signal-line system and use the same optical scale as their neighbors.

## Components

### Masthead and Catalog Search

The masthead is a compact, sticky equipment bar. On desktop it balances the independent typographic wordmark, one centered catalog search, and the independence disclosure. Below 820px it becomes a menu button, search field, and optional info mark; below 600px the info mark and placeholder retreat, while the search icon and live count keep the field understandable.

- **Search field:** Dark inset control, 10px corners, 42px desktop height and 40px compact height, search icon on the left, live tabular result count on the right.
- **Focus:** Mint border, slightly lighter black fill, and the global focus-visible outline. Do not add a glow or shadow.
- **Behavior:** Search across name, hardware lineage, job, and genre; Escape clears a non-empty query. The visible count is live status, not decoration.
- **Wordmark:** Uppercase typographic name plus three mint signal bars. Never substitute Softube's official mark.

### Production-Job Navigation and Category Rail

These are ruled navigation systems, not buttons or cards. Job links combine a mint signal icon, a plain-language production verb, and a chevron in a 54px row. Hover changes text and rule color and nudges the chevron 4px. The category rail gives mixing and mastering first position, uses a 2px mint active indicator, and scrolls horizontally on narrow screens without wrapping or clipping labels.

### Quick Decision Map and Method Panel

The primer is a two-axis decision system: first choose one of eight signal contexts, then choose the exact production job. Its 47 routes cover vocals, drums and percussion, bass and low end, guitars, synths and instruments, buses and mastering, space and movement, and sound design and lo-fi. Every route states the goal, a grounded first pick, the role that pick should perform, and the nearest useful comparison. Both picks deep-link to the exact catalog record, opening its category and record automatically. An “All routes” view exposes the complete map; focused context views keep ordinary use compact. Recommendations are entry points, never scores or rankings.

### Methodology Disclosure

The complete methodology, hardware-label definitions, and decision table live in a quiet soft-mist native disclosure with a 12px radius. Its plus/minus indicator is textual and mint-dark. Preserve the source research and semantic disclosure behavior; the compact primer summarizes it but does not replace it.

### Catalog Sections

Each numbered category is a native disclosure separated by a light graphite rule. The summary uses a large title, mint section number, count, and rotating chevron. The first section opens by default only above 600px; all categories start collapsed on mobile. Deep links and search may open their target category.

### Catalog Records

Each record is a native disclosure row, square and shadowless, with a 68px minimum summary. The record name leads, the evidence lineage follows in uppercase metadata, and a chevron communicates expansion. Hover uses soft mist without translation or lift. The expanded body starts with a compact official-media strip: one square thumbnail, a precise destination label, and a ruled outbound link. Current product pages say “View product”; suite components link to their parent collection; discontinued or documentation-only entries say “Official reference.” Never disguise a manual or parent product as a standalone product page. The fast practical fields follow in a mint wash divided into four columns on desktop, two at intermediate widths, and one on mobile.

Below those fast-scan fields, a white “Why this one?” comparison explains the record's advantage over nearby choices. A second native disclosure labeled “Producer deep dive” contains the heavier working material: an optional closed “Modes & personalities” selector guide, advanced techniques with audible checkpoints, instrument/source/bus applications, conservative pairings, non-obvious behavior when evidence supports it, reasons to choose something else, and official evidence links. Mode guides belong only to standalone processors with a named selector that materially changes algorithm, character, or workflow; exclude channel strips, collections, ordinary ratios, routing, stereo link, and utility states. Render modes as flat ruled rows with “Reach for it when,” “Expect,” and “Watch” fields—never as a card wall or a substitute manual. Keep this two-level hierarchy: comparison guidance is immediately visible when a record opens, while reference-heavy material remains optional. Search indexes both levels even when the nested disclosure is closed.

Lineage dots use three provenance states, explained by a compact key above the catalog:

- Unlicensed hardware identifications use a transparent dot with a dashed research-blue outline.
- Softube originals use a ringed graphite dot.
- Official brand partnerships use a filled mint dot with a grounded-mint border.

The Quick decision map reuses these exact markers beside every first-pick recommendation. Do not introduce a separate recommendation-bullet color system.

The detailed lineage text remains authoritative for exact models, archetypes, hybrids, collections, and legacy status. Lifecycle and product type do not create additional dot styles.

On mobile, the hidden summary-line lineage must be repeated as the first expanded field labeled “Model / inspiration.” Do not remove it from the data model.

### Genre Signal-Path Patterns

Genre is context rather than prescription. Each recipe is a native disclosure whose closed state names the style and target outcome. The open state shows a linked signal path with one explicit role per stage, followed by three practical fields: a conservative first pass, swap logic for adjacent choices, and a failure mode to monitor. Plugin names deep-link to exact catalog records. Keep the recipes flat and ruled; they are reusable production architectures, not preset cards.

### Search Feedback and Empty State

Active search uses a mint-wash status strip with the exact result statement and a compact outlined clear action. Zero results uses a pale error surface and fault-red text, then suggests a hardware family, job, genre, or shorter query. Do not replace these states with silent emptiness or promotional recommendations.

### Mobile Navigation Drawer

The drawer is a square, full-height soft-black overlay up to 390px wide or 92vw. It includes the complete guide navigation, close control, active-section state, and independence footer. Opening it makes background layers inert, moves focus to close, traps focus inside, supports Escape and scrim dismissal, and restores focus to the menu button on ordinary close. The shadow and scrim belong to the open modal state only.

### Motion

The only authored entrance is the three-bar wordmark signal revealing once over 700ms with the system's settling curve. Disclosure chevrons and interactive states use short 180–320ms transitions. Motion never reveals otherwise hidden content, and reduced-motion preference effectively disables animation, transitions, and smooth scrolling.

**The Native-Disclosure Rule.** Keep catalog categories and records as semantic `details`/`summary` interactions. Styling may evolve; their keyboard behavior, open state, print expansion, and progressive-enhancement role may not.

**The No-Commerce-Control Rule.** This product has navigation, search, disclosure, and utility controls—not purchase buttons, favorites, prices, ratings, sorting theater, or affiliate actions.

## Do's and Don'ts

### Do:

- **Do** treat `styles.css` as the current visual source of truth and keep `index.html`, `styles.css`, and `app.js` behavior aligned when the catalog or interaction model changes.
- **Do** keep the independent-reference disclosure visible in the interface and pair it with the typographic field-guide identity.
- **Do** lead with production jobs and mixing/mastering while keeping every researched catalog area reachable.
- **Do** preserve all record content, lineage distinctions, deep links, search terms, live counts, and mobile field order when restyling or refactoring.
- **Do** use 1px graphite rules, 2px mint active indicators, the 3px visible focus outline, and the existing authored icon stroke system consistently.
- **Do** validate desktop, mobile, active search, open record, open drawer, reduced motion, keyboard focus, deep links, and print after structural changes.
- **Do** keep movement purposeful and fully optional; all information must remain visible and usable without animation.
- **Do** update every catalog-count expression and verification statement together if the researched roster changes.

### Don't:

- **Don't** reuse the overridden warm-paper, red, orange, gold, blurred, pill-shaped, raised-card visual system embedded near the top of `index.html`; it is predecessor code, not current brand guidance.
- **Don't** turn the catalog, primer, recipes, or page scaffolding into a rounded card grid. Cards are not the default container primitive.
- **Don't** add gradients, glassmorphism, broad shadows, hover lift, decorative texture, or multiple accent colors to create visual interest.
- **Don't** imitate official Softube trade dress, use an official logo, or imply endorsement, partnership, ranking, or commercial intent.
- **Don't** add prices, purchase calls to action, favorites, ratings, affiliate behavior, unsupported filters, or invented claims.
- **Don't** hide lineage or practical fields at narrow widths; relocate them into the expanded record instead.
- **Don't** mix icon sources, use Unicode stand-ins, or change the established line weight from component to component.
- **Don't** allow any surface other than the category rail and tables to create horizontal scrolling.
