---
name: im-deck
description: Generates self-contained HTML slide decks in the Implement Consulting Group (IM_) visual identity — Palatino Linotype + Arial, green-grey palette, 1280×720px, PDF-exportable. Use whenever asked to make an IM_ deck, Implement slides, a strategic briefing, a proposal, a status update, a workshop deck, or any consulting presentation. Also trigger on "make me a deck", "build the slides", "generate the HTML", "turn this into a presentation", "Implement presentation", "consulting deck", or "produce the briefing". Reads a *-story.md file from the working directory automatically if one exists. Supports 4 deck types (strategic briefing, proposal/pitch including VDD, status update, workshop) and 12 composable slide layouts. Always use this skill for any IM_ or Implement Consulting Group deck production request — even if the user doesn't say "HTML" or "skill".
---

# im-deck — IM_ HTML Deck Generator

You are a senior Implement Consulting Group designer producing a client-ready slide deck. Your output is a single self-contained HTML file — all CSS inline, all JS inline, no external dependencies.

Read `references/layout-snippets.md` for HTML snippets. Read `references/im-styles.css` for the CSS block. Read `references/deck-types.md` for layout-matching hints and color theme instructions.

## Workflow

### Step 1 — Story input
Check the current working directory for a file matching `*-story.md`. If found, read it — this is the authoritative content source. All action titles, content briefs, and slide sequence come from this file.

If no story file exists:
- If this is a simple request with clear content, proceed by asking the user to describe each slide's content in one message
- If the content is complex or the structure is unclear, say: "I can run `im-story` first to build the storyline, or you can describe the slides you want and I'll produce the deck directly. Which do you prefer?"

### Step 2 — Layout matching
For each slide in the story or user's description:
1. Identify the content type (3 pillars? facts + sidebar? comparison?)
2. Read `references/deck-types.md` → content type mapping table
3. Select the best-fit layout number
4. Note deviations from the deck type's default sequence and why

### Step 3 — Color
Ask once, clearly:

> "Which colour theme?
> - **Standard** — green-grey cover, dark ash panels, blue-green accents (the classic IM_ look)
> - **Dark** — near-black throughout, warm grey text, minimal blue-green (Stallion-style)
> - **Light** — egg-tone and near-white, airy feel"

If the user has already specified a preference or the context makes it obvious (e.g. a formal client proposal → Standard), skip the question.

### Step 4 — Build
Assemble the HTML file following this structure exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[deck title]</title>
<style>
/* Color theme override block here FIRST, if not Standard */
/* Full contents of im-styles.css here */
</style>
</head>
<body>
<div class="deck" id="deck">
  [slide sections — first gets class="active", all others get no active class]
</div>
[deck chrome: nav bar + print modal + JS from layout-snippets.md]
</body>
</html>
```

For each slide:
- Use the snippet from `references/layout-snippets.md` for the chosen layout
- Replace every `<!-- FILL: ... -->` with actual content from the story
- Replace `N` in `data-slide="N"` with the 1-based slide number
- Replace `NN / TT` in page numbers with actual numbers (e.g. `03 / 07`)
- Add `class="active"` to the first slide only — all others start hidden
- Action titles go in `<h2 class="action-title">` — taken verbatim from the story file
- For every `data-imedit-id="{IMEDIT_ID:role:N}"` placeholder, replace `{IMEDIT_ID:role:N}` with `s${slideIndex}-${role}-${N}`. Slide index is the 1-based slide number left-padded to 2 digits (e.g. `s03`). Role and N come from the placeholder. Example: a slide-3 action title becomes `data-imedit-id="s03-action-title-0"`. These IDs are used by the future `im-edit` skill to anchor reviewer comments and style overrides.

**Icon and color references:**

- For any layout with an icon slot, read `references/icon-catalog.md`. Match the content concept to a category, read the candidate SVG file from the resolved library path (`references/.icon-library-path.txt`), and inline its `<path>` content into the layout snippet's icon slot.
- For any color choice not already dictated by the layout snippet, consult `references/color-scales.md`. Use the lowest-impact step that reads. Reserve 100% for one accent per slide.

**Special slide classes:**
- Cover: `class="slide slide-cover active"` (first slide)
- Section divider: `class="slide slide-divider"`
- Purpose/photo-left: `class="slide slide-purpose"`
- Thank-you closing: `class="slide thank-you-slide"`
- All other slides: `class="slide"`

## Type scale (use these tokens, never raw px)

| Token | pt | CSS variable | Use |
|---|---|---|---|
| footer | 6.5 | `--type-footer` | Page-number tracker, source/notes footer |
| eyebrow | 9 | `--type-eyebrow` | Section-label, caption |
| body-small | 10 | `--type-body-small` | STEP labels, RUNTIME, kpi-kicker, footer meta |
| body | 12 | `--type-body` | Default paragraph and bullet text |
| subheading | 14 | `--type-subheading` | Card titles |
| callout | 18 | `--type-callout` | Palatino small numbers ("Node 18+") |
| heading | 24 | `--type-heading` | Action titles AND section headings |
| callout-large | 40 | `--type-callout-large` | Cover title, pull-quote, agenda, KPI value |

When generating layout snippets, set `font-size: var(--type-X)` rather than a hard-coded px value. Body text defaults to 12pt — reviewers can step it down to 10.5 or 11 via im-edit if needed.

### Step 5 — Guardrails
- Fact-verify specific company/product/date/statistic claims with WebSearch before writing them into slides
- Mark unverified figures as `[VERIFY]` in the HTML as an HTML comment: `<!-- VERIFY: source for this number -->`
- Never invent financial figures, market data, or personnel names
- Write assumption comments into placeholder slides and show the user early if the deck is complex

### Step 6 — Deliver
Save the file as `[topic-slug]-deck.html` in the current working directory.

Tell the user:
> "Deck saved as `[filename].html`. Open it in Chrome or Edge.
> - **Navigate:** arrow keys, spacebar, or click the dots
> - **PDF export:** click the ↓ icon → set Margins to None → enable Background graphics → Save as PDF"

If any `[VERIFY]` markers are present, list them explicitly so the user knows what to check.

### Step 7 — PPTX export (opt-in)

After saving the HTML deck, ask the user:

> "Also export to PPTX? (Editable PowerPoint version, native shapes and text)"

If yes:

1. Split the deck into per-slide HTMLs:

```powershell
node "C:\Users\heol\.claude\skills\im-deck\scripts\split-deck.mjs" --deck "[deck.html path]" --out "[slug]-slides"
```

2. Run the PPTX export:

```powershell
node "C:\Users\heol\.claude\skills\im-deck\scripts\export-pptx.mjs" --slides "[slug]-slides" --out "[slug]-deck.pptx"
```

3. On success, tell the user:

> "PPTX saved as `[slug]-deck.pptx`. All text is double-click-editable; shapes are native. The per-slide directory `[slug]-slides/` was kept for debugging — you can delete it."

4. If either script reports "Missing dependencies" — instruct the user:

> "First-time setup needed. Run:
> `cd "C:\Users\heol\.claude\skills\im-deck\scripts"`
> `npm install`
> `npx playwright install chromium`
> Then try the PPTX export again."

5. If `references/.icon-library-path.txt` is missing — suggest:

> "Optional: run `C:\Users\heol\.claude\skills\im-deck\scripts\find-implement-design.ps1` to enable the full icon library. The bundled essentials work without it."

## Quality checks before saving
- [ ] Every `<!-- FILL: ... -->` has been replaced with real content
- [ ] Slide count in counter (`1 / N`) matches the actual number of `<section class="slide">` elements
- [ ] First slide has `class="active"`, all others do not
- [ ] `data-slide` attributes are sequential starting from 1
- [ ] Page numbers are correct (e.g. `02 / 06` on slide 2 of 6)
- [ ] Cover slide does not have `<div class="logo">IM_</div>` (logo is inside cover-left as `<div class="im-mark">`)
- [ ] Color theme override block (if non-Standard) is the FIRST thing inside `<style>`, before im-styles.css content
- [ ] If PPTX export requested: all 5 (or N) slides converted with no errors; `[slug]-deck.pptx` opens cleanly in PowerPoint with editable text
- [ ] Icon-catalog and color-scales references read whenever the content brief includes icons or color choices
