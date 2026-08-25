# Plug-in mode guide schema

`data/plugin-mode-guides.json` is an optional producer-facing layer for standalone plug-ins with a named selector that materially changes processing character, algorithm, or workflow.

It intentionally excludes channel strips, collections, Volumes, ordinary ratio choices, stereo-link and routing switches, oversampling, and other utility states. A short, unsupported list is worse than no guide; every included choice must be grounded in a current official manual or product page. When Softube deliberately withholds a mode's hardware identity or tonal ranking, keep that uncertainty visible and cite any secondary triangulation used.

Each entry has the exact catalog `name`, one or two selector `groups`, and the official `sources` used. A group contains the selector label, a short comparison summary, and two to ten modes. Each mode answers three producer questions:

- `choose_for`: when this is the useful starting choice;
- `sound`: what behavior or audible personality changes;
- `watch_for`: the specific tradeoff, failure mode, or common misunderstanding.

The layer is rendered as a closed `Modes & personalities` disclosure inside Producer deep dive. It should help a producer choose before touching detailed settings, not reproduce the complete product manual.
