<div align="center">

# The Softube Field Guide

**An independent, producer-first map of the Softube catalog.**

[![Live guide](https://img.shields.io/badge/open-the_live_guide-00c795?style=for-the-badge&labelColor=111312)](https://chpiatt.github.io/softube-field-guide/)
[![Catalog](https://img.shields.io/badge/catalog-166_entries-2875be?style=for-the-badge&labelColor=111312)](https://chpiatt.github.io/softube-field-guide/#catalog-index)
[![License: MIT](https://img.shields.io/badge/license-MIT-f4f6f5?style=for-the-badge&labelColor=111312)](LICENSE)

*Find the right tool for the job—then learn how to get more from it.*

</div>

> [!IMPORTANT]
> This is an independent editorial reference. It is not affiliated with, endorsed by, or published by Softube.

## Why this guide exists

Softube's catalog contains overlapping processors, component versions, channel strips, host-specific modules, suites, and legacy products. Product pages explain what is being sold; this guide is built to answer the producer's next questions:

- Which similar option fits this source or bus?
- What does the hardware lineage actually imply in use?
- Which controls, modes, and non-obvious techniques matter most?
- Where can the processor be loaded—dedicated, Console 1, Modular, Equalizers, Amp Room, Amplifiers, or Flow?
- When is another Softube tool the better choice?

The result is a job-first field manual rather than a storefront or a rewritten product catalog.

## What is inside

| Layer | What it helps you do |
| --- | --- |
| **Quick decision map** | Enter through 47 signal-and-job routes, with a grounded first pick and a useful comparison. |
| **Complete catalog** | Search and browse 166 researched entries without losing suites, components, or compatibility-only products. |
| **Platform filter** | Isolate products available in a specific Softube environment and see their exact module or channel-strip location. |
| **Why this one?** | Compare close alternatives in producer language before opening the longer reference material. |
| **Producer deep dives** | Apply advanced moves, instrument/source/bus uses, conservative pairings, hidden talents, cautions, and evidence. |
| **Modes & personalities** | Compare 131 meaningful choices across 27 standalone processors without turning ordinary switches into filler. |
| **Official destinations** | Open the relevant product page, parent collection, or official reference beside a catalog thumbnail. |

The interface is progressively disclosed, searchable, deep-linkable, keyboard accessible, and responsive from a 390 px mobile viewport through wide desktop layouts.

## Evidence and provenance

Accuracy is part of the product design. The guide keeps three provenance states visually distinct:

- **Unlicensed identification** — the donor hardware is identifiable, but no official brand relationship is claimed.
- **Softube original** — a purpose-built Softube processor, algorithm, or combination.
- **Official brand partnership** — Softube or the hardware partner explicitly documents the relationship.

Recognizable hardware is not automatically a licensed model. Primary manuals and manufacturer pages take priority; engineering inferences are labeled; ambiguous optional advice is omitted. A blank pairing or insider note is better than confident folklore.

For the editorial contracts, see:

- [`research/PLUGIN_ENRICHMENT_SCHEMA.md`](research/PLUGIN_ENRICHMENT_SCHEMA.md)
- [`research/PLUGIN_MODE_GUIDE_SCHEMA.md`](research/PLUGIN_MODE_GUIDE_SCHEMA.md)
- [`research/ACCURACY_AUDIT.md`](research/ACCURACY_AUDIT.md)
- [`research/EDITORIAL_HANDOFF.md`](research/EDITORIAL_HANDOFF.md)

## Repository map

```text
index.html                         catalog source, guide copy, and static fallback
styles.css                        implemented visual system and responsive behavior
app.js                            progressive enhancement, search, filters, and disclosures
data/
  plugin-deep-dives.json          display-ready comparisons and production guidance
  plugin-mode-guides.json         selector modes and producer-facing personalities
  plugin-platforms.json           verified host and platform availability
  plugin-product-media.json       official destinations and thumbnail metadata
research/
  batches/                        merge-safe editorial source batches
  build-*.mjs                     deterministic data builders
  validate-*.mjs                  catalog, schema, and coverage gates
PRODUCT.md                        product purpose and editorial boundaries
DESIGN.md                         visual system and interaction contract
```

The site intentionally has no framework, package manager, database, analytics layer, or production build step. The research data is JSON; the public experience is plain HTML, CSS, and JavaScript.

## Run locally

Any static server works. From the repository root:

```sh
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Opening `index.html` directly is useful for a quick content check, but a local server is required for the JSON-backed enhancement layer.

## Validate a change

Run the complete local gate from the repository root:

```sh
node --check app.js
node research/validate-enrichment.mjs
node research/validate-mode-guides.mjs
node research/validate-platform-availability.mjs
node research/validate-product-media.mjs
git diff --check
```

For a networked audit of every enrichment source URL:

```sh
node research/check-source-urls.mjs
```

The URL audit is intentionally separate because it performs live requests and can fail when the network—not the source—is unavailable.

## Editing the research safely

1. Verify behavior against a current primary source whenever possible.
2. Edit the appropriate file in `research/batches/` rather than treating generated deep-dive JSON as the only source of truth.
3. Rebuild with `node research/build-enrichment.mjs` when enrichment batches change.
4. Preserve exact catalog names: they join the static cards, data layers, search index, platform map, and deep links.
5. Run every validator and inspect the relevant desktop and mobile disclosure.
6. Publish only after the live GitHub Pages build is checked—not merely after a successful push.

Platform availability deserves extra caution. Do not infer Console 1 sections, Modular usability, or suite inclusion from a processor's type or name.

## Deployment

The public site is served by GitHub Pages from the `main` branch:

**[chpiatt.github.io/softube-field-guide](https://chpiatt.github.io/softube-field-guide/)**

Cache-busting query versions on `styles.css`, `app.js`, and fetched datasets should be advanced whenever their deployed contents change.

## License and trademarks

The project source code and original repository documentation are available under the [MIT License](LICENSE).

Softube and all referenced product, company, and hardware names are trademarks of their respective owners. Linked product imagery and third-party source material remain the property of their owners. Their appearance here is for independent identification, commentary, comparison, and research; it does not imply sponsorship or affiliation.
