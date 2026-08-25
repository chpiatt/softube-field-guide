# Deep-dive editorial handoff

`data/plugin-deep-dives.json` is the merge-safe, display-ready enrichment layer for all 166 catalog cards. It stays separate from `index.html` so the visual-design work can consume it without reconciling a second set of card edits.

## What each entry adds

1. **`comparative_edge`** — the first thing to show: why a producer would choose this plug-in over nearby Softube options.
2. **`advanced_moves`** — two reproducible techniques with setup, action, audible success criterion, and the reason the technique works.
3. **`use_cases`** — two source-, instrument-, bus-, or sound-design-specific applications. Genre appears only when the production idiom materially changes the move.
4. **`pairings`** — zero to two useful two-plug-in chains, including order/routing, division of labor, caution, and whether the pairing is documented, attributed, or an engineering inference.
5. **`insider_note`** — a non-obvious documented behavior or clearly labeled inference, never anonymous folklore.
6. **`avoid_when`** — a wrong-tool case and, where useful, a better Softube direction.
7. **`evidence`** — primary-source titles and URLs for editorial review and optional source disclosure.

The complete layer currently contains 166 comparisons, 332 advanced moves, 332 use cases, and 83 pairings. Empty pairing arrays are intentional: a well-supported omission is better than a forced chain. `insider_note` may also be `null` when the documentation is ambiguous; the display must omit that callout rather than render a placeholder.

## Suggested presentation

Keep the existing card concise. Put **Why this one?** (`comparative_edge`) at the top of a progressively disclosed deep-dive panel, followed by tabs or short accordions for **Advanced moves**, **Sources & buses**, and **Pairings**. Keep **Avoid when** visible near the choice guidance. Put `insider_note` in a restrained callout, and source links at the bottom rather than in the main reading flow.

For pairings, surface the `basis` label. “Documented” and “Attributed” are externally sourced; “Engineering inference” is editorial advice justified by the processors' complementary behavior. Do not silently flatten those evidence levels.

## Build and validation

Run from the repository root:

```sh
node research/validate-enrichment.mjs
node research/build-enrichment.mjs
node research/check-source-urls.mjs
```

The validator checks exact coverage against the catalog in `index.html`, card names and sections, field shapes, word limits, mixing-use-case coverage, partner names, pairing attribution requirements, duplicate/missing entries, and evidence presence. The build script merges the five research batches into catalog order and writes `data/plugin-deep-dives.json`. The URL checker performs a live request for every distinct evidence and pairing URL; it requires network access.

The authoring contract and evidence rules are in `research/PLUGIN_ENRICHMENT_SCHEMA.md`.
