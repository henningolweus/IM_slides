#!/usr/bin/env bash
# Install the IM_ skills into Claude Code's skill directory (macOS/Linux).
# Usage:
#   ./scripts/install.sh             # install all three with backup
#   ./scripts/install.sh --dry-run   # show what would happen, change nothing
#   ./scripts/install.sh --no-backup # overwrite without backup

set -euo pipefail

dry_run=false
no_backup=false
for arg in "$@"; do
    case "$arg" in
        --dry-run)   dry_run=true ;;
        --no-backup) no_backup=true ;;
        *) echo "Unknown flag: $arg" >&2; exit 2 ;;
    esac
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skills=(im-story im-deck im-edit)
skills_dir="$HOME/.claude/skills"
backup_dir="$HOME/.claude/skills.backup"
stamp="$(date +%Y%m%d-%H%M%S)"

if [ ! -d "$skills_dir" ]; then
    echo "Creating $skills_dir"
    $dry_run || mkdir -p "$skills_dir"
fi

for skill in "${skills[@]}"; do
    src="$repo_root/$skill"
    dst="$skills_dir/$skill"

    [ -d "$src" ] || { echo "ERROR: source skill not found: $src" >&2; exit 1; }

    if [ -d "$dst" ]; then
        if $no_backup; then
            echo "REMOVE: $dst (no backup)"
            $dry_run || rm -rf "$dst"
        else
            backup_path="$backup_dir/$skill-$stamp"
            echo "BACKUP: $dst -> $backup_path"
            if ! $dry_run; then
                mkdir -p "$backup_dir"
                mv "$dst" "$backup_path"
            fi
        fi
    fi

    echo "INSTALL: $src -> $dst"
    if ! $dry_run; then
        # rsync if available (preserves permissions), otherwise cp -R
        if command -v rsync >/dev/null 2>&1; then
            rsync -a --exclude 'node_modules' "$src/" "$dst/"
        else
            cp -R "$src" "$dst"
            find "$dst" -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true
        fi
    fi
done

if $dry_run; then
    echo "DRY RUN - nothing changed."
else
    echo "Install complete. Restart Claude Code to pick up changes."
fi
