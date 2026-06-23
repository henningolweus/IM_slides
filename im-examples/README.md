# im-examples — Inspiration corpus for IM_ deck skills

A library of real proposal slides (text + structure, no thumbnails yet), indexed into a JSON manifest that the three IM_ skills (`im-story`, `im-first-draft`, `im-deck`) consult for tone, structure, and phrasing when building **proposal/pitch** decks.

The corpus is **proposal-specific**. It is not consulted for strategic briefings, status updates, or workshop decks.

---

## What's here

| File | Role | Tracked in git? |
|---|---|---|
| `manifest.config.json` | Lists the source PPTX files + maps each to a scaffold slot and default layout | Yes |
| `build-manifest.mjs` | Indexer: parses each PPTX (zipped XML) and emits `manifest.json` | Yes |
| `lookup.mjs` | Token-efficient slice loader the skills call into | Yes |
| `package.json` / `package-lock.json` | `jszip` dependency for the indexer | Yes |
| `manifest.json` | Generated. Contains real proposal text — **kept gitignored** | No |
| `node_modules/` | Build deps | No (gitignored) |
| `thumbnails/` | Reserved for future PNG rendering | No (gitignored) |

---

## Building / rebuilding

```powershell
cd im-examples
npm install            # first time only
node build-manifest.mjs
```

The indexer reads `manifest.config.json` for the source list and the corresponding PPTX files from wherever `examples_root` points. Add or remove sources by editing `manifest.config.json` and re-running. The raw PPTX files live outside the repo so the corpus contents stay portable across machines.

---

## Section ↔ proposal-scaffold mapping

Each section in the corpus corresponds to a specific slot in the 25-slide IM_ proposal scaffold (see `im-story/references/deck-types.md`). When a skill is drafting a slot, it should consult the matching section.

| Section name | Scaffold slot | Default layout | Notes |
|---|---|---|---|
| `closing-letter` | Slide 25 (and slide 2 opener) | `photo-left-content:letter` | Both the opening and closing partner letters |
| `intro-scq` | Slide 5 | `two-panel:scr` | Situation / Complications / Key Questions |
| `approach-scope` | Slide 14 | `moves-grid` | Module overview |
| `project-plan` | Slide 15 | `gantt-process` | Week-by-week Gantt |
| `team-investment` | Slide 18 | `team-and-investment` | Team photos + fee panel |
| `collaboration` | Slide 11 | `ring-diagram` | Co-creation / one-team |
| `about-implement` | Slide 23 | `two-panel:about-firm` | Firm description + principles |
| `why-implement` | Slide 24 | `iconic-3-column:sidebar` | Differentiation |

Slides not in this list (cover, contents, section dividers, credentials, methodology, requirements matrix, person bios, client references) currently have no corpus section. Add new PPTX sources to `manifest.config.json` to extend coverage.

---

## How agents use the corpus

**Detection.** First check whether the corpus is present:

```powershell
node im-examples/lookup.mjs --status
```

Output looks like `present=true` plus generation timestamp and counts, or `present=false` if `manifest.json` hasn't been built yet. The `generate-firstdraft.mjs` script also writes `examples_corpus_present` into firstdraft state.

**Loading slices.** Never `Read` the full `manifest.json` — it's hundreds of slides. Use `lookup.mjs` to pull only what's needed:

```powershell
# List all sections
node im-examples/lookup.mjs --list

# All slides in a section (full content)
node im-examples/lookup.mjs --section intro-scq

# Brief: titles + 200-char previews only (token-efficient)
node im-examples/lookup.mjs --section intro-scq --brief

# One specific slide
node im-examples/lookup.mjs --section closing-letter --slide 2

# All slides whose candidate_layout matches a tag
node im-examples/lookup.mjs --layout gantt-process
```

All output is JSON to stdout. Use `--brief` first to scan; pull the full slide(s) only for the 1–3 that look most relevant.

**Citation.** When an agent draws meaningfully on a corpus slide, the output should cite it briefly (e.g., as a comment in story files, a `<!-- inspired by: closing-letter slide 2 -->` HTML comment in deck files, or a "Sources" line in chat). This lets the reviewer trace the lineage.

---

## Privacy

`manifest.json` contains real text extracted from past IM_ proposals — client names, project descriptions, dates, occasionally figures. It is **gitignored** by design and must not be committed. The `manifest.config.json` (which only contains file names + scaffold metadata) is safe to commit.

If you need to share the corpus with another machine, copy `manifest.config.json` + the raw PPTX files separately, then run `npm install && node build-manifest.mjs` on the receiving machine to regenerate.

---

## Limitations (v1)

- **No visual thumbnails yet.** Layout classification per slide is heuristic-only. To fix, render each slide to PNG (via LibreOffice / Playwright) and store under `thumbnails/<section>/<index>.png`.
- **No "Example N" grouping.** Some sections contain multiple separate example proposals strung together; the indexer treats them as a flat slide list. A future pass can detect dividers and group into example bundles.
- **Firstdraft modal slot not populated.** `sorter.js` has an `.ifd-real-examples` placeholder but does not yet fetch from this corpus. Wiring that up needs thumbnails to be visually useful.
