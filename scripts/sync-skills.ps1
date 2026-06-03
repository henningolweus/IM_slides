#!/usr/bin/env pwsh
# Copy canonical shared/ files into each skill's expected local location.
# Run this after editing anything in shared/. Idempotent.

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

# Map: source under shared/  ->  list of destinations relative to repo root
$syncMap = @{
    'style-catalogue.json' = @(
        'im-edit\assets\style-catalogue.json',
        'im-deck\references\style-catalogue.json'
    )
}

foreach ($src in $syncMap.Keys) {
    $srcPath = Join-Path $repoRoot "shared\$src"
    if (-not (Test-Path $srcPath)) {
        Write-Error "Missing canonical file: $srcPath"
    }
    foreach ($dst in $syncMap[$src]) {
        $dstPath = Join-Path $repoRoot $dst
        $dstDir = Split-Path -Parent $dstPath
        if (-not (Test-Path $dstDir)) {
            New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
        }
        Copy-Item -Path $srcPath -Destination $dstPath -Force
        Write-Output "synced: shared\$src -> $dst"
    }
}
Write-Output "Sync complete."
