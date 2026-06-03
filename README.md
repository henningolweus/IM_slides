# IM_ Skills

Three Claude Code skills for producing client-ready slide decks in the Implement Consulting Group (IM_) visual identity.

| Skill | Purpose |
|---|---|
| **im-story** | Build the storyline. Governing thought → top-down action titles → slide-level content briefs. No HTML. |
| **im-deck** | Generate a self-contained HTML deck (Palatino + Arial, green-grey palette, 1280×720). Reads `*-story.md` from the working dir. PPTX export included. |
| **im-edit** | In-browser editor for an existing IM_ deck. Toolbar, semantic style picker, font/size/color overrides, comment pins. State persists in the deck file. |

## How they compose

```
       ┌─────────────┐       ┌────────────┐       ┌────────────┐
words ─▶│  im-story  │──md──▶│  im-deck   │──html▶│  im-edit   │── reviewed html
       └─────────────┘       └────────────┘       └────────────┘
```

You can also use any skill alone — e.g. open an existing IM_ HTML deck directly with im-edit, or write your own story brief and feed it to im-deck.

## Install (Windows)

```powershell
git clone <this-repo-url> im-skills
cd im-skills
.\scripts\install.ps1
```

Existing skills in `%USERPROFILE%\.claude\skills\` are moved to `%USERPROFILE%\.claude\skills.backup\<skill>-<timestamp>\` before install. Use `-NoBackup` to skip the backup, or `-DryRun` to preview.

Restart Claude Code after install.

## Install (macOS / Linux)

```bash
git clone <this-repo-url> im-skills
cd im-skills
./scripts/install.sh
```

Same backup behaviour. Flags: `--dry-run`, `--no-backup`.

## Active development

If you'll be editing skills frequently, use **dev-link** to junction the skill folders into Claude's directory instead of copying. Edits in the repo show up immediately:

```powershell
.\scripts\dev-link.ps1
```

Junctions don't require admin on Windows. Undo with `.\scripts\dev-link.ps1 -Undo`. (macOS/Linux: use `ln -s` manually for now.)

## The shared style catalogue

`shared/style-catalogue.json` is the canonical type-token + named-style definition. It's used by im-edit's chrome.js to render the Globals panel and apply overrides, and is available to im-deck for future features that need the catalogue.

**When you change it:** edit `shared/style-catalogue.json`, then run:

```powershell
.\scripts\sync-skills.ps1     # Windows
./scripts/sync-skills.sh      # macOS/Linux
```

Commit the resulting changes to `im-edit/assets/style-catalogue.json` and `im-deck/references/style-catalogue.json` together with the canonical.

## Per-skill setup

The im-deck and im-edit skills include Node scripts (PPTX export, chrome injection). On first use, Claude Code (or you) needs to install their dependencies:

```powershell
cd im-deck\scripts; npm install
cd im-edit\scripts; npm install
```

Each `scripts/` folder has its own `package.json` and `.gitignore` excluding `node_modules/`.

## Future: Claude plugin manifest

A Claude plugin manifest (`plugin.json` at the repo root) would let colleagues install all three skills with a single Claude Code command instead of running a script. This is deferred — the script-based install above is the supported path for now. When ready to add a plugin, see the Anthropic plugin docs and add the manifest without restructuring this layout.

## Layout

```
im-skills/
├── shared/             # canonical assets (style-catalogue.json)
├── scripts/            # install + sync + dev-link
├── im-story/           # skill 1
├── im-deck/            # skill 2
└── im-edit/            # skill 3
```

## License

MIT — see `LICENSE`.
