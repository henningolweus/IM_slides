# Layout catalog — canonical tag vocabulary

This file is the **source of truth** for layout names and content tags used across:
- `im-first-draft` (alternatives modal candidates)
- `im-examples/manifest.json` (when the corpus exists)
- `im-deck` references

When you add a new layout to `im-deck`, add it here too. Scripts parse the fenced JSON below.

Some layouts support **variants** (e.g. `two-panel:scr`). The `variants` array on each catalog entry lists the supported variant names; `plain` (or no suffix) means the base layout.

```json
[
  { "layout": "cover", "tags": ["cover", "opening"] },
  { "layout": "photo-left-content", "tags": ["opening", "framework", "text-section", "letter", "contents", "purpose"], "variants": ["purpose", "letter", "contents"] },
  { "layout": "segment-divider", "tags": ["section-break", "transition", "divider"], "variants": ["photo", "solid"] },
  { "layout": "iconic-3-column", "tags": ["three-parallel", "structured-data", "thesis", "credentials"], "variants": ["icon", "photo", "sidebar"] },
  { "layout": "bleed-right", "tags": ["facts-with-sidebar", "structured-data", "list-of-items"] },
  { "layout": "two-panel", "tags": ["comparison", "list-of-items", "facts-with-sidebar", "framework", "scr", "about-firm", "header-band"], "variants": ["plain", "scr", "header-band", "about-firm"] },
  { "layout": "moves-grid", "tags": ["numbered-sequence", "structured-data", "list-of-items", "framework", "workstreams"] },
  { "layout": "timeline", "tags": ["numbered-sequence", "structured-data", "process-or-milestones"] },
  { "layout": "purpose-photo-left", "tags": ["DEPRECATED: use photo-left-content:purpose"] },
  { "layout": "kpi-dashboard", "tags": ["three-parallel", "structured-data", "metrics"] },
  { "layout": "comparison-table", "tags": ["comparison", "structured-data", "framework", "strategic-options"], "variants": ["plain", "strategic-options"] },
  { "layout": "pull-quote", "tags": ["text-section", "visual-statement", "narrative-prose"] },
  { "layout": "full-width-body", "tags": ["text-section", "list-of-items", "narrative-prose", "framework"] },
  { "layout": "photo-card-grid", "tags": ["credentials", "references", "experts", "card-grid"] },
  { "layout": "ring-diagram", "tags": ["ring", "collaboration", "co-creation"] },
  { "layout": "team-and-investment", "tags": ["team", "investment", "proposal-team"] },
  { "layout": "person-bio", "tags": ["bio", "person", "cv", "team"] },
  { "layout": "quantified-summary", "tags": ["quantified", "chart-and-initiatives"] },
  { "layout": "vertical-numbered-list", "tags": ["criteria", "considerations", "phases", "vertical-list"], "variants": ["numbered", "lettered"] },
  { "layout": "gantt-process", "tags": ["process", "workstreams", "gantt"] }
]
```
