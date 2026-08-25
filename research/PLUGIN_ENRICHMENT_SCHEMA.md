# Plug-in enrichment research schema

This is an additive editorial data layer for the existing 166 catalog cards. It is intentionally separate from `index.html` so visual-design work can continue without content merge conflicts. The layer is a producer's field guide, not a second version of Softube's product pages.

## Research standard

- Cover every card in the assigned sections exactly once, using the card's displayed name verbatim.
- Prefer Softube product pages and user manuals. For licensed hardware or modules, the partner manufacturer's documentation is also acceptable.
- Do not repeat the existing `Best at`, `Choose it when`, `Get more from it`, or `Genre move` copy. Extend them with materially deeper choices and techniques.
- Distinguish documented facts from listening/workflow inferences. Do not invent fixed settings when the documented control range or program behavior varies.
- Avoid purchase language, prices, superlatives, or unsupported hardware identifications.
- Use specifications only when they causally explain why a technique works or why this product wins a particular comparison.
- An `insider_note` must be a documented non-obvious behavior, an attributable technique, or a clearly identified engineering inference. Never invent anonymous studio folklore.
- Keep each field useful at the point of use. The intended display is a progressively disclosed "Deep dive" area, not another long essay.

## Batch JSON shape

Each batch file is a JSON array. Every object must use this exact shape:

```json
{
  "name": "Exact card name",
  "section": 1,
  "comparative_edge": "How and why to choose it over the closest Softube alternatives. Name the peers and the production consequence. Maximum 70 words.",
  "advanced_moves": [
    {
      "setup": "Source, routing, or starting state.",
      "action": "A reproducible multi-step technique; settings may be ranges or listening-based.",
      "listen_for": "The audible success criterion.",
      "why_it_works": "The control or circuit behavior that explains the result."
    }
  ],
  "use_cases": [
    {
      "context_type": "instrument | bus | genre | sound-design",
      "context": "The practical context, such as lead vocal, drum bus, parallel room, bass subgroup, or a genuinely distinctive genre idiom.",
      "source_or_bus": "The target source, bus, or instrument role.",
      "application": "A concrete, reproducible application.",
      "why_this_plugin": "Why this product, rather than its closest peers, is especially apt here."
    }
  ],
  "pairings": [
    {
      "partner": "Exact field-guide card name where possible",
      "goal": "The specific combined effect or division of labor.",
      "order": "A → B, parallel routing, or another explicit topology.",
      "setup": "A concise reproducible starting method.",
      "why_it_works": "The causal reason the two processors complement each other.",
      "caution": "A concrete overuse, order, phase, gain-staging, or recall caveat.",
      "basis": "documented | attributed | engineering-inference",
      "source_url": "https://... or null"
    }
  ],
  "insider_note": "A non-obvious documented behavior, attributable technique, or clearly labeled engineering inference. Use null when there is no honest candidate.",
  "avoid_when": "A specific wrong-tool case and a better Softube direction where possible. Maximum 50 words.",
  "evidence": {
    "basis": "documented | documented-plus-editorial-inference | compatibility-note",
    "sources": [
      {
        "title": "Human-readable source title",
        "url": "https://..."
      }
    ]
  }
}
```

## Editorial interpretation

- `comparative_edge` answers: “Why this one instead of the two things beside it?”
- `advanced_moves` answers: “What can an experienced producer do beyond the obvious first preset?” Use two moves per entry; add a third only when it is genuinely distinct.
- `use_cases` answers: “Where does this choice become especially meaningful?” For mixing processors, include at least two instrument- or bus-specific cases per entry; an optional third genre case is useful only when the production idiom materially changes the technique. For instruments and Modular, include at least one instrument-role or sound-design case plus a contrasting use. Genre must not substitute for source and routing context.
- `pairings` answers: “Which second Softube product completes a known or particularly effective technique?” Use zero to two entries; an empty array is honest and preferable to forcing a combination. Include the processing order or routing. `documented` means the manufacturer describes the pairing; `attributed` requires a named engineer/producer source; `engineering-inference` must be causally explained and may use a null source URL. The classic fast-FET-into-slower-opto vocal chain is the model: each stage has a different envelope job.
- `insider_note` answers: “What non-obvious behavior changes how an expert would use this?” It may be an engineering inference, but must say so.
- `avoid_when` answers: “When is a neighboring Softube option the smarter tool?”
- `basis` is `documented` only when all material assertions are directly supported by sources. Use `documented-plus-editorial-inference` when translating documented behavior into an engineering consequence. Use `compatibility-note` for retired/legacy recall products.

One strong primary source is sufficient for ordinary entries. Use two or more sources when suite contents, partner hardware behavior, or compatibility status cannot be supported by a single page.
