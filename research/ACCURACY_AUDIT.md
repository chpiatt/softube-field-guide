# Accuracy audit — 2026-08-24

The 166-entry enrichment layer received a second, claim-level audit after its initial completion. The rule for this pass was conservative: omit an optional pairing or insider note when its behavior could not be defended from the cited official documentation and ordinary signal-processing principles.

## Checks performed

- Re-opened the official Softube manual or product source used by every entry.
- Rechecked comparisons, control names, signal order, routing, advanced moves, source/bus use cases, insider notes, avoid guidance, and pairings.
- Distinguished manufacturer-documented pairings from attributed techniques and engineering inferences.
- Removed generic or speculative pairings rather than preserving them for coverage.
- Replaced obsolete or redundant source URLs with current official manuals.
- Sent every distinct cited URL through a live HTTP check after the edits.
- Rebuilt the display dataset and reran exact catalog/schema validation.

## Material corrections

- Removed 17 weak, generic, or insufficiently supported pairing objects. The final layer has 83 pairings; 87 cards intentionally have none.
- Corrected Wasted Space guidance that referred to a nonexistent control.
- Corrected Model 72 external-input gating and Model 77 pressure behavior.
- Limited Korgasmatron and Rubicon tracking claims to documented behavior.
- Replaced an invalid uFold auxiliary-input technique with a documented self-patch.
- Corrected Rings/PEG routing.
- Corrected static-EQ ordering explanations: changing the order of linear, static EQ stages is not inherently different; order becomes consequential with dynamics, level dependence, or nonlinear stages.
- Clarified Tube-Tech Classic Channel and Empirical Labs Trak Pak routing.
- Corrected Weiss Exciter dry-path wording and softened Tape THD-matching claims.
- Removed two unsupported Bad Speaker combinations and two speculative dynamics/channel-strip combinations.
- Set the Tonelux Tilt insider note to `null` because the available manual contains contradictory filter labels/ranges.
- Replaced a dead Chandler Curve Bender PDF URL with the current official manual.
- Refined Reference 1956 from a generic Pultec-family label to the more specific unlicensed Manley Enhanced Pultec identification. Softube documents unnamed modern stereo hardware with added frequencies; Manley's own design notes describe its Enhanced Pultec as a cleaner mastering descendant retaining the original EQ values and adding frequencies. The guide still labels this as an unlicensed identification rather than a Softube attribution.

## Final evidence

```text
166 entries
332 advanced moves
332 use cases
83 pairings
139/139 distinct cited URLs live
0 duplicate or missing catalog entries
0 repeated long-form move/use-case strings
```

Pairing evidence levels in the final dataset are 33 `documented`, one `attributed`, and 49 `engineering-inference`. Engineering inferences remain clearly labeled in the data and include their routing rationale and caution; they must not be presented as manufacturer recommendations.
