# Deck Types — im-deck Layout-Matching Reference

Use this to select the right layout for each slide, and to apply color themes.

---

## Content type → layout mapping

| Content type | Primary layout | Fallback |
|---|---|---|
| Deck opener | 1 — Cover | — |
| 3 parallel pillars / points | 3 — Iconic 3-column | 4 — Two-panel (for 2 points) |
| Facts / assets + key numbers sidebar | 2 — Bleed-right panel | 4 — Two-panel |
| Ownership / governance / comparison / team+fee | 4 — Two-panel | — |
| 4–6 numbered initiatives, plays, workstreams | 5 — Moves grid | 12 — Full-width + bullets |
| Timeline / milestones / signals | 6 — Alternating timeline | — |
| Section break / ToC marker | 7 — Section divider | — |
| Workshop objective / why we're here | 8 — Purpose / photo-left | 12 — Full-width body text |
| 3–4 headline metrics with RAG status | 9 — KPI dashboard | 4 — Two-panel |
| Benchmarking / feature comparison matrix | 10 — Comparison table | 4 — Two-panel |
| Single powerful statement / closing | 11 — Pull quote | — |
| Text body: intro, appendix, next steps, instructions | 12 — Full-width body text | — |

---

## Per-deck-type layout hints

### Strategic briefing (6–8 slides)
Default slide → layout mapping:
1. Cover → Layout 1
2. Thesis → Layout 3 (iconic 3-column)
3. Facts/transaction → Layout 2 (bleed-right)
4. Governance/implications → Layout 4 (two-panel)
5. Plays/moves → Layout 5 (moves grid)
6. Signals/timeline → Layout 6 (alternating timeline)

Deviations: use Layout 4 if thesis has 2 pillars; skip Layout 5 if purely analytical.

### Proposal / pitch (10–18 slides)
1. Cover → Layout 1
2. Intro/thank-you → Layout 12 (no action title on this slide)
3. ToC → Layout 7 (section divider)
4. Firm credentials → Layout 4 (two-panel)
5. Experience pillars → Layout 3 (iconic 3-column)
6. References → Layout 2 (bleed-right)
7. Section break → Layout 7
8. Executive summary → Layout 12
9. Sample analysis slides → see content type mapping above
10. Section break → Layout 7
11. Scope → Layout 5 (moves grid)
12. Process → Layout 6 (alternating timeline)
13. Section break → Layout 7
14. Team + fee → Layout 4 (two-panel)
15. Advisory board → Layout 2 (bleed-right)
16. Client references → Layout 12
17. Thank you → Layout 11 (pull quote, thank-you-slide class)

VDD variant: slides 8–9 use Layouts 12, 2, 4, 2 for the four VDD lenses.

### Status / project update (5–7 slides)
1. Cover → Layout 1
2. KPI metrics → Layout 9 (kpi-dashboard)
3. Workstream progress → Layout 5 (moves grid)
4. Issues & mitigations → Layout 4 (two-panel)
5. Milestone timeline → Layout 6 (alternating timeline, mark completed as confirmed)
6. Next steps → Layout 12 (full-width body text)

### Workshop / facilitation (8–15 slides)
1. Cover → Layout 1
2. Objectives → Layout 8 (purpose/photo-left)
3. Section break → Layout 7
4. Exercise brief → Layout 12 (full-width, generous whitespace)
5. Framework template → Layout 4 (two-panel) or Layout 12 with a table
6. Insight → Layout 11 (pull quote)
Repeat 3–6 for each session part. Closing → Layout 12.

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
2. How many items? (2 → two-panel, 3 → iconic 3-col, 4–6 → moves grid)
3. Is there a coloured sidebar worth having? → bleed-right, else two-panel
4. Does the slide need whitespace for live viewing? → full-width body text