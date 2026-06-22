# Layout catalog — canonical tag vocabulary

This file is the **source of truth** for layout names and content tags used across:
- `im-first-draft` (alternatives modal candidates)
- `im-examples/manifest.json` (when the corpus exists)
- `im-deck` references

When you add a new layout to `im-deck`, add it here too. Scripts parse the fenced JSON below.

```json
[
  { "layout": "cover", "tags": ["cover"] },
  { "layout": "iconic-3-column", "tags": ["pillars", "three-parallel-points", "experience-pillars", "value-propositions"] },
  { "layout": "bleed-right", "tags": ["facts-plus-sidebar", "assets-grid", "references-grid", "advisory-board"] },
  { "layout": "two-panel", "tags": ["comparison", "ownership", "team-and-fee", "framework", "before-and-after", "belief-and-prompts"] },
  { "layout": "moves-grid", "tags": ["4-6-initiatives", "workstreams", "numbered-plays", "scope-modules"] },
  { "layout": "timeline", "tags": ["milestones", "signals-to-watch", "process-and-milestones"] },
  { "layout": "section-divider", "tags": ["section-break", "toc-marker", "part-transition"] },
  { "layout": "purpose-photo-left", "tags": ["workshop-objective", "why-were-here", "project-context"] },
  { "layout": "kpi-dashboard", "tags": ["3-4-headline-metrics", "rag-status"] },
  { "layout": "comparison-table", "tags": ["benchmark", "feature-matrix", "competitive-landscape"] },
  { "layout": "pull-quote", "tags": ["provocation", "key-insight", "closing-statement"] },
  { "layout": "full-width-body", "tags": ["intro-text", "exercise-brief", "executive-summary", "next-steps", "appendix"] }
]
```
