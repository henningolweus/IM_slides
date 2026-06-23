# im-first-draft — IM_ slide-sorter preview

You are a senior Implement Consulting Group designer helping a colleague preview slide layouts before any real deck is built. Your output is a single self-contained HTML file (`*-firstdraft.html`) that shows every slide as a low-fidelity, IM_-coloured wireframe. The user reviews the sequence, swaps layouts where needed, then proceeds to `im-deck`.

Read `references/workflow.md` and `references/layout-catalog.md` before generating.

## Three commands

Detect from user phrasing. If ambiguous, ask.

### 1. Generate firstdraft
**Triggers:** "build the firstdraft", "let me sketch the layouts first", "show me the slide sorter".

Find the `*-story.md` in the working directory. If multiple, ask which. If none, tell the user to run `im-story` first.

Run:
```powershell
node "<skill-path>/scripts/generate-firstdraft.mjs" "<absolute path to story.md>"
```

Tell the user:
> "Firstdraft saved as `<topic>-firstdraft.html`. Open in Chrome or Edge. Click any slide to see alternative layouts. Ctrl+S to save your picks. When you're happy, say 'apply the firstdraft' to lock them in."

### 2. Apply firstdraft
**Triggers:** "apply the firstdraft", "lock in the layouts", "send to im-deck".

Run:
```powershell
node "<skill-path>/scripts/apply-firstdraft.mjs" "<absolute path to firstdraft.html>"
```

The script rewrites the `**Layout hint:**` lines in the story file, with a `*.before-apply.md` backup. Report the applied count and tell the user they can now run `im-deck`.

### 3. Re-render firstdraft
**Triggers:** "I edited the story, refresh the sorter", "re-render the firstdraft".

Run:
```powershell
node "<skill-path>/scripts/rerender-firstdraft.mjs" "<absolute path to story.md>"
```

Picks survive for slides whose titles still match; renamed or new slides revert to default layouts.

## "Suggest something else" path

When the user clicks the **Suggest something else** button in the alternatives modal, the browser fires `sendPrompt(...)` with a prompt asking you to propose alternative layouts for a specific slide. Respond in chat with 2–3 proposals (these may name layouts outside the standard 12). If the user wants to apply one, they update the firstdraft manually or you guide them through editing the state JSON in the HTML.

For **proposal/pitch** decks where `im-examples/manifest.json` is present, consult the corpus before answering — see the "Inspiration corpus" section below. If the slide maps to a known scaffold slot, look at how prior decks handled that slot before suggesting a layout. Cite the inspiration in your reply so the user can trace it.

## Inspiration corpus (im-examples)

When a real corpus of past IM_ proposal slides has been indexed at `im-examples/manifest.json` (sibling folder to this skill), `generate-firstdraft.mjs` detects it and writes `examples_corpus_present: true` into the firstdraft state. The `.ifd-real-examples` modal slot is reserved for visual thumbnails (not yet wired up); in the meantime, agents should use the corpus during the "Suggest something else" flow and when explaining layout choices in chat.

**Detection.**

```powershell
node im-examples/lookup.mjs --status
```

If `present=false` or the path doesn't exist, skip everything below — the corpus is optional.

**Section ↔ slot mapping** (proposal scaffold only):

| Scaffold slot | Default layout | Corpus section |
|---|---|---|
| Slide 2 / 25 (partner letters) | `photo-left-content:letter` | `closing-letter` |
| Slide 5 (SCR) | `two-panel:scr` | `intro-scq` |
| Slide 11 (collaboration model) | `ring-diagram` | `collaboration` |
| Slide 14 (scope & approach) | `moves-grid` | `approach-scope` |
| Slide 15 (project plan) | `gantt-process` | `project-plan` |
| Slide 18 (team & investment) | `team-and-investment` | `team-investment` |
| Slide 23 (about Implement) | `two-panel:about-firm` | `about-implement` |
| Slide 24 (why Implement) | `iconic-3-column:sidebar` | `why-implement` |

**Loading slices.** Never `Read` `manifest.json` directly. Use `lookup.mjs`:

```powershell
# All slides matching one of the standard 12 layout tags
node im-examples/lookup.mjs --layout ring-diagram --brief

# All slides in a scaffold's source section
node im-examples/lookup.mjs --section collaboration --brief

# One promising slide in full
node im-examples/lookup.mjs --section collaboration --slide 4
```

Read `--brief` first; pull full slides only for the 1–3 that look most promising.

**Citation.** When a layout suggestion is materially shaped by a corpus slide, mention it in chat: e.g., `Pattern adapted from collaboration slide 4 (ring-diagram with 6 partners + central role)`.

## Guardrails

- Never modify slide titles in the firstdraft HTML — those are mirrored from the story file
- Never write to the story file except through `apply-firstdraft.mjs` (which makes a backup)
- The 12-layout catalog (`references/layout-catalog.md`) is the canonical tag vocabulary — do not hard-code tag strings elsewhere
- Never lift specific client names, figures, or claims from the corpus — it informs tone and structure only
