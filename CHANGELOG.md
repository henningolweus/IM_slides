# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-06-03

### Added
- Initial monorepo packaging of the three IM_ skills (im-story, im-deck, im-edit).
- `shared/style-catalogue.json` as canonical type-token + named-style source.
- `scripts/sync-skills.ps1` and `scripts/sync-skills.sh` to propagate shared assets into each skill.
- `scripts/install.ps1` and `scripts/install.sh` to deploy skills into `~/.claude/skills/` with timestamped backups.
- `scripts/dev-link.ps1` for junction-based live development on Windows.
- README with composition diagram, install instructions, and shared-catalogue workflow.
- MIT license.

### Skills snapshot at v0.1.0
- **im-story**: storyline builder (governing thought, action titles, content briefs).
- **im-deck**: HTML deck generator with PPTX export, 4 deck types, 12 layouts, 3 colour variants.
- **im-edit**: in-browser editor with chrome.js (~40 KB), semantic style picker, comment pins, global overrides, shape-container commenting.
