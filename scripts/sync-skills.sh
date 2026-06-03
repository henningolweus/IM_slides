#!/usr/bin/env bash
# Copy canonical shared/ files into each skill's expected local location.
# Run this after editing anything in shared/. Idempotent.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Pairs: "<src under shared/> <dst relative to repo root>"
pairs=(
    "style-catalogue.json im-edit/assets/style-catalogue.json"
    "style-catalogue.json im-deck/references/style-catalogue.json"
)

for pair in "${pairs[@]}"; do
    src="${pair% *}"
    dst="${pair#* }"
    src_path="$repo_root/shared/$src"
    dst_path="$repo_root/$dst"
    if [ ! -f "$src_path" ]; then
        echo "ERROR: missing canonical file: $src_path" >&2
        exit 1
    fi
    mkdir -p "$(dirname "$dst_path")"
    cp -f "$src_path" "$dst_path"
    echo "synced: shared/$src -> $dst"
done
echo "Sync complete."
