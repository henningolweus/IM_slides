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

For **Proposal / pitch** decks, if the corpus at `im-examples/manifest.json` is present (run `node im-examples/lookup.mjs --status` to check), consult the matching section before finalising the layout choice for any scaffold slot. See the "Inspiration corpus" section below for the mapping table and lookup commands.

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

Write the file as UTF-8 without BOM. Use the Write tool (default is correct). If scripting via PowerShell, use `[IO.File]::WriteAllText($path, $html, [Text.UTF8Encoding]::new($false))` — PowerShell 5.1's `Out-File`/`Set-Content` default to UTF-16 LE and will produce mojibake when the browser interprets the file as UTF-8.

Tell the user:
> "Deck saved as `[filename].html`. Open it in Chrome or Edge.
> - **Navigate:** arrow keys, spacebar, or click the dots
> - **PDF export:** click the ↓ icon → set Margins to None → enable Background graphics → Save as PDF"

If any `[VERIFY]` markers are present, list them explicitly so the user knows what to check.

## Editing self-contained decks safely (UTF-8 contract)

A generated deck file is self-contained — all CSS is inlined into a single `<style>` block. When iterating on CSS, you regenerate that inline block from the master `im-styles.css`. **You must never** use the naive PowerShell pattern:

```powershell
# WRONG — corrupts every UTF-8 character (€, …, •, —, ·) into mojibake
$css = Get-Content "im-styles.css" -Raw
$deck = Get-Content "deck.html" -Raw
$deck = $deck -replace '<style>.*?</style>', "<style>$css</style>"
Set-Content "deck.html" $deck
```

Windows PowerShell 5.1's `Get-Content` and `Set-Content` default to Windows-1252, not UTF-8. Every round-trip mojibakes UTF-8 sequences. This has bitten this skill multiple times.

**Always use the helper** `scripts/refresh-deck-inline-css.ps1` instead:

```powershell
powershell "C:\Users\heol\.claude\skills\im-deck\scripts\refresh-deck-inline-css.ps1" `
  -DeckPath "C:\path\to\your-deck.html"
```

This reads and writes via `[System.IO.File]::ReadAllText` / `WriteAllText` with an explicit `UTF8Encoding($false)` — no BOM, no codepage drift. It also fails loudly if no `<style>` block is found, so you don't silently no-op.

After every CSS change inside the repo, the standard flow is:

1. Edit `im-deck/references/im-styles.css`
2. Mirror via `Copy-Item ... -Force` to `~/.claude/skills/im-deck/references/im-styles.css`
3. Run `refresh-deck-inline-css.ps1 -DeckPath <deck>` to push the new CSS into your working deck
4. Commit the CSS change to the repo

If you find mojibake in a deck file (search for `â€¦` or `â,¬`), the file is already corrupted — regenerating the deck from scratch (via the im-deck skill) is the cleanest fix; partial sed-style replacements rarely catch every mojibaked sequence.

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

### Step 8 — Brand-master swap (opt-in)

`export-pptx.mjs` builds a PPTX from scratch with pptxgenjs, which means the file ships with pptxgenjs's default slide master — not the Implement (IM_) corporate master with the logo, fonts, and section colours. To inherit a real PowerPoint master, run the post-processor `apply-master.mjs` after Step 7.

Ask the user:

> "Apply a corporate slide master? (Wraps the deck in your brand frame — logo, footer, theme — without changing slide content. Needs a path to a template .pptx or .potx.)"

If yes:

1. Optionally inspect what layouts the template has (helpful for proposing the right cover layout):

```powershell
node "C:\Users\heol\.claude\skills\im-deck\scripts\apply-master.mjs" --template "<template path>" --list-layouts
```

2. Run the swap:

```powershell
node "C:\Users\heol\.claude\skills\im-deck\scripts\apply-master.mjs" `
  --deck "[slug]-deck.pptx" `
  --template "<template path>" `
  --out "[slug]-deck-branded.pptx"
```

By default the script picks the layout named **"Blank"** for content slides and **"Cover A1"** (or the first `type=title` layout) for slide 1. Override with `--content-layout "<name>"` and `--cover-layout "<name>"` if the template uses different names.

**What `apply-master.mjs` does to slide content automatically:**

- **Master frame is provided by the template** — the deck's own `.logo`, `.im-mark`, `.im-mark-vertical`, and `.page-number` elements are filtered out at the HTML→PPTX stage (in `html2pptx.js`) so we don't render a duplicate logo / page number on top of the master's.
- **Action titles become real placeholders** — `.action-title` shapes get tagged `objectName="IM_TITLE"` during HTML→PPTX, then promoted to `<p:ph type="title"/>` in `apply-master.mjs`. The layout's "Click to add title" prompt disappears and the shape registers as the slide's title (used by PowerPoint's outline view, accessibility, etc.).
- **Titles inherit layout defaults** — by default, the title shape's hardcoded position (`<a:xfrm>`), paragraph properties, and text formatting (font, size, weight, colour, alignment) are stripped so the layout's title placeholder controls them. This fixes the common "white title on white master" problem when a dark-theme deck is re-mastered onto a light template, and ensures titles line up with the template's grid. Pass `--no-reset-titles` to keep the deck's hardcoded title styling instead.

3. On success, tell the user:

> "Branded PPTX saved as `[slug]-deck-branded.pptx` — slides inherit the template's master (logo, theme, footer) and titles snap to the layout's title placeholder. Body shapes still use the deck's hardcoded positions and colours. Open and verify in PowerPoint."

4. Caveat to mention if the user reports unexpected body-text colours: the reset only applies to titles. Body shapes (lists, captions, table cells) keep their CSS-derived hex values. A separate CSS-side colour sweep mapping the deck's greens/greys to the template's theme colours is needed for full theme inheritance on body content.

## Inspiration corpus (im-examples)

When a real corpus of past IM_ proposal slides has been indexed at `im-examples/manifest.json` (sibling folder to this skill), consult it during Step 2 (Layout matching) and Step 4 (Build) for **Proposal / pitch** decks. Do **not** consult it for Strategic briefing, Status update, or Workshop decks — those have no corpus coverage.

**Detection.**

```powershell
node im-examples/lookup.mjs --status
```

If `present=false` or the path doesn't exist, proceed without it — the corpus is optional.

**Section ↔ slot mapping.** Each corpus section maps to one scaffold slot:

| Scaffold slot | Layout | Corpus section |
|---|---|---|
| Slide 2 / 25 (partner letters) | `photo-left-content:letter` | `closing-letter` |
| Slide 5 (SCR) | `two-panel:scr` | `intro-scq` |
| Slide 11 (collaboration model) | `ring-diagram` | `collaboration` |
| Slide 14 (scope & approach) | `moves-grid` | `approach-scope` |
| Slide 15 (project plan) | `gantt-process` | `project-plan` |
| Slide 18 (team & investment) | `team-and-investment` | `team-investment` |
| Slide 23 (about Implement) | `two-panel:about-firm` | `about-implement` |
| Slide 24 (why Implement) | `iconic-3-column:sidebar` | `why-implement` |

Slides outside this table (cover, ToC, segment dividers, methodology, references, etc.) have no corpus section — build them from the scaffold + story brief alone.

**Loading slices (token-efficient).** Never `Read` `manifest.json` directly — it's hundreds of slides. Use `lookup.mjs`:

```powershell
# Scan: titles + 200-char previews
node im-examples/lookup.mjs --section project-plan --brief

# Drill: full content of one slide
node im-examples/lookup.mjs --section project-plan --slide 7

# Cross-section: all slides matching a layout tag
node im-examples/lookup.mjs --layout gantt-process --brief
```

Read `--brief` first; pull the full slide(s) only for the 1–3 that look most relevant.

**How to use what you find.** The corpus exists to inform **layout choice, structure, and phrasing**, not to be copied. For each slot:
- Look at how prior decks resolved the same content type (e.g., how many workstreams on a gantt? how many partners on a ring diagram? how is the SCR right panel numbered?)
- Adopt patterns that fit this client's brief; never lift specific client names, figures, dates, or claims
- If the story brief carries a `*Inspired by: <section> slide N*` line from im-story, fetch that exact slide first to honour the original intent

**Citation.** When a slide's structure is materially shaped by corpus inspiration, add an HTML comment immediately inside the `<section class="slide">` tag:

```html
<!-- inspired-by: collaboration slide 4 -->
```

This keeps the lineage discoverable in the source without affecting render.

## Quality checks before saving
- [ ] Every `<!-- FILL: ... -->` has been replaced with real content
- [ ] Slide count in counter (`1 / N`) matches the actual number of `<section class="slide">` elements
- [ ] First slide has `class="active"`, all others do not
- [ ] `data-slide` attributes are sequential starting from 1
- [ ] Page numbers are correct (e.g. `02 / 06` on slide 2 of 6)
- [ ] Cover slide does not have `<div class="logo">IM_</div>` (logo is inside cover-left as `<div class="im-mark">`)
- [ ] Color theme override block (if non-Standard) is the FIRST thing inside `<style>`, before im-styles.css content
- [ ] If PPTX export requested: all 5 (or N) slides converted with no errors; `[slug]-deck.pptx` opens cleanly in PowerPoint with editable text
- [ ] If brand-master swap requested: `[slug]-deck-branded.pptx` opens in PowerPoint and shows the template's logo/frame; counts in the run output match (slides rewired = slide count, layouts copied = template's full set)
- [ ] Icon-catalog and color-scales references read whenever the content brief includes icons or color choices
- [ ] Every action title is ≤120 characters (≈3 lines at 24pt). If longer, restructure as `<strong>Section label</strong> | short declarative clause`.
- [ ] No layout exceeds its safe card count: `.team-grid` ≤ 6 cards in 3 columns (2 rows); `.assets-grid` ≤ 4 cards; `.qs-initiative-card` ≤ 4.
- [ ] Exactly one slide has the `active` class (`grep -c 'class="[^"]*\bactive\b' deck.html` must return 1).
- [ ] The deck-chrome block from `references/layout-snippets.md` is pasted verbatim immediately before `</body>`. Verify the `<script>` substring `updateScale()` appears at least three times.
- [ ] File is saved as UTF-8 without BOM. First three bytes must NOT be `EF BB BF` and the file must NOT contain mojibake sequences like `â€"`.
- [ ] Open the deck in Chrome/Edge: slide 1 visible; arrow keys advance; no console errors; navigating through every slide shows distinct content.
