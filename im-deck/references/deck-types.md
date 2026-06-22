# Deck Types — im-deck Layout-Matching Reference

Use this to select the right layout for each slide, and to apply color themes.

---

## Content type → layout mapping

| Content type | Primary layout | Fallback |
|---|---|---|
| Deck opener | `cover` | — |
| 3 parallel pillars / points | `iconic-3-column` | `two-panel` (for 2 points) |
| Facts / assets + key numbers sidebar | `bleed-right` | `two-panel` |
| Ownership / governance / comparison / SCR | `two-panel` | — |
| 4–6 numbered initiatives, plays, workstreams | `moves-grid` | `full-width-body` + bullets |
| Timeline / milestones / signals | `timeline` | — |
| Section break / segment divider | `segment-divider` | — |
| Workshop objective / why we're here | `photo-left-content:purpose` | `full-width-body` |
| Proposal opening letter | `photo-left-content:letter` | — |
| Agenda / contents | `photo-left-content:contents` | — |
| 3–4 headline metrics with RAG status | `kpi-dashboard` | `two-panel` |
| Benchmarking / feature comparison matrix | `comparison-table` | `two-panel` |
| Strategic options / pros-cons matrix | `comparison-table:strategic-options` | `two-panel` |
| Single powerful statement / closing | `pull-quote` | — |
| Text body: intro, appendix, next steps | `full-width-body` | — |
| Credentials / experience grid | `photo-card-grid` | `iconic-3-column:photo` |
| Co-creation / collaboration model | `ring-diagram` | — |
| Team + investment | `team-and-investment` | — |
| Person bio / CV | `person-bio` | — |
| Cost potential / quantified opportunity | `quantified-summary` | `kpi-dashboard` |
| Success criteria / phases / considerations | `vertical-numbered-list:numbered` | `vertical-numbered-list:lettered` |
| Process plan / Gantt | `gantt-process` | `timeline` |
| SCR situation + complication | `two-panel:scr` | `two-panel` |
| About-firm summary | `two-panel:about-firm` | `two-panel` |
| Methodology / framework with header band | `two-panel:header-band` | `two-panel` |

---

## Per-deck-type layout hints

### Strategic briefing (6–8 slides)
Default slide → layout mapping:
1. Cover → `cover`
2. Thesis → `iconic-3-column`
3. Facts/transaction → `bleed-right`
4. Governance/implications → `two-panel`
5. Plays/moves → `moves-grid`
6. Signals/timeline → `timeline`

Deviations: use `two-panel` if thesis has 2 pillars; skip `moves-grid` if purely analytical.

### Proposal / pitch (25 slides — canonical structure)

**Opening (slides 1–3):**
1. `cover` — "Letter of proposal — prepared by Implement Consulting Group"; photo or solid right panel
2. `photo-left-content:letter` — partner thank-you letter, signed with name + role; photo left carries the "Change with impact" wordmark overlay
3. `photo-left-content:contents` — numbered section list (4–6 sections); action title is just "Contents" (no declarative sentence)

**Section 1 — Background & objectives (~3 slides):**
4. `segment-divider` — Section 01 label + section name; use photo variant by default
5. `two-panel:scr` — left panel: situation + complications; right panel: numbered key questions/objectives with green-grey circles; optional "FOR DISCUSSION" tag top-right
6. `quantified-summary` — cost/value potential with chart left + numbered initiative cards right

**Section 2 — Our perspectives (~5–7 slides):**
7. `segment-divider` — Section 02
8. `vertical-numbered-list:numbered` — 5 success criteria, each with a bold title + 1–2 supporting bullets
9. `photo-card-grid` — credentials ("We know X / We have Y / We bring Z"); 3–4 column grid, each card: photo placeholder + title + description
10. `two-panel:header-band` — methodology or framework with shared header band spanning both panels
11. `ring-diagram` — co-creation / one project team; client left circle, Implement right circle, overlap area labelled
12. `iconic-3-column:photo` *(optional)* — philosophy or approach pillars, icon circles replaced with photo cards

**Section 3 — Scope & approach (~3–5 slides):**
13. `segment-divider` — Section 03
14. `moves-grid` or `iconic-3-column` — module overview (Module A / B / C / D)
15. `gantt-process` — week-by-week project plan; month/week column headers × workstream rows × activity bands; bottom row for meetings and touchpoints
16. `comparison-table` *(optional)* — requirements matrix or `comparison-table:strategic-options` for strategic options A–E

**Section 4 — Team & investment (~3 slides):**
17. `segment-divider` — Section 04
18. `team-and-investment` — team photo grid left (Core team + SMEs sub-sections) + fee panel right with assumptions and terms
19. `person-bio` × N *(optional)* — one slide per key team member

**Section 5 — Appendix (~5–10 slides):**
20. `segment-divider` — Section 05 / Appendix; use solid variant if no contextual image
21. `photo-card-grid` — client references
22. `person-bio` × N — extended CVs for team members
23. `two-panel:about-firm` — about Implement; dark left panel with title + chart, white right with 4 numbered "We are…" principles
24. `iconic-3-column:sidebar` — why Implement; left sidebar with icon + "Why Implement?" label, 3 columns right

**Closing:**
25. `photo-left-content:letter` — closing thank-you letter, partner signature; mirrors slide 2

### Status / project update (5–7 slides)
1. Cover → `cover`
2. KPI metrics → `kpi-dashboard`
3. Workstream progress → `moves-grid`
4. Issues & mitigations → `two-panel`
5. Milestone timeline → `timeline` (mark completed as confirmed)
6. Next steps → `full-width-body`

### Workshop / facilitation (8–15 slides)
1. Cover → `cover`
2. Objectives → `photo-left-content:purpose`
3. Section break → `segment-divider`
4. Exercise brief → `full-width-body` (generous whitespace)
5. Framework template → `two-panel` or `full-width-body` with a table
6. Insight → `pull-quote`
Repeat 3–6 for each session part. Closing → `full-width-body`.

---

## Color theme application

### Standard (default)
No CSS override needed. Use im-styles.css as-is.

### Dark (Stallion-style)
Uncomment and paste the `/* DARK THEME */` block from im-styles.css at the very top of the `<style>` tag in the generated HTML, before all other CSS.

Key visual effect: near-black (`#1F2023`) backgrounds throughout, warm grey (`#F2F2F1`, `#E1E0DE`) text and panels, blue-green (`#67817F`) used only for underlines, bullet dots, and border accents — never as a panel fill.

### Light
Uncomment and paste the `/* LIGHT THEME */` block from im-styles.css at the very top of the `<style>` tag.

Key visual effect: egg-tone (`#F8F5E7`) cover left, near-white (`#F1F4F3`) cover right, standard IM_ light palette throughout.

---

## Layout selection checklist

Before generating HTML, for each slide in the story:
1. What is the content type? → match to the table above
2. How many items? (2 → `two-panel`, 3 → `iconic-3-column`, 4–6 → `moves-grid`)
3. Is there a coloured sidebar worth having? → `bleed-right`, else `two-panel`
4. Does the slide need whitespace for live viewing? → `full-width-body`
