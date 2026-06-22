# Layout catalog — canonical tag vocabulary

This file is the **source of truth** for layout names and content tags used across:
- `im-first-draft` (alternatives modal candidates)
- `im-examples/manifest.json` (when the corpus exists)
- `im-deck` references

When you add a new layout to `im-deck`, add it here too. Scripts parse the fenced JSON below.

```json
[
  { "layout": "cover", "tags": ["cover", "opening"] },
  { "layout": "iconic-3-column", "tags": ["three-parallel", "structured-data", "thesis"] },
  { "layout": "bleed-right", "tags": ["facts-with-sidebar", "structured-data", "list-of-items"] },
  { "layout": "two-panel", "tags": ["comparison", "list-of-items", "facts-with-sidebar", "framework"] },
  { "layout": "moves-grid", "tags": ["numbered-sequence", "structured-data", "list-of-items", "framework"] },
  { "layout": "timeline", "tags": ["numbered-sequence", "structured-data", "process-or-milestones"] },
  { "layout": "section-divider", "tags": ["text-section", "visual-statement", "transition"] },
  { "layout": "purpose-photo-left", "tags": ["opening", "framework", "text-section"] },
  { "layout": "kpi-dashboard", "tags": ["three-parallel", "structured-data", "metrics"] },
  { "layout": "comparison-table", "tags": ["comparison", "structured-data", "framework"] },
  { "layout": "pull-quote", "tags": ["text-section", "visual-statement", "narrative-prose"] },
  { "layout": "full-width-body", "tags": ["text-section", "list-of-items", "narrative-prose", "framework"] }
]
```
