#!/usr/bin/env pwsh
# Install the IM_ skills into Claude Code's skill directory (Windows).
# Usage:
#   .\scripts\install.ps1            # install all three with backup
#   .\scripts\install.ps1 -DryRun    # show what would happen, change nothing
#   .\scripts\install.ps1 -NoBackup  # overwrite without backup (use with care)

param(
    [switch]$DryRun,
    [switch]$NoBackup
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$skills = @('im-story', 'im-deck', 'im-edit')
$skillsDir = Join-Path $env:USERPROFILE '.claude\skills'
$backupDir = Join-Path $env:USERPROFILE '.claude\skills.backup'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if (-not (Test-Path $skillsDir)) {
    Write-Output "Creating $skillsDir"
    if (-not $DryRun) { New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null }
}

foreach ($skill in $skills) {
    $src = Join-Path $repoRoot $skill
    $dst = Join-Path $skillsDir $skill

    if (-not (Test-Path $src)) {
        Write-Error "Source skill not found: $src"
    }

    if (Test-Path $dst) {
        if ($NoBackup) {
            Write-Output "REMOVE: $dst (no backup)"
            if (-not $DryRun) { Remove-Item -Recurse -Force $dst }
        } else {
            $backupPath = Join-Path $backupDir "$skill-$stamp"
            Write-Output "BACKUP: $dst -> $backupPath"
            if (-not $DryRun) {
                if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
                Move-Item -Path $dst -Destination $backupPath
            }
        }
    }

    Write-Output "INSTALL: $src -> $dst"
    if (-not $DryRun) {
        # robocopy excludes node_modules (defense in depth - repo shouldn't have any, but safe)
        robocopy $src $dst /MIR /XD node_modules /NFL /NDL /NJH /NJS /NP | Out-Null
    }
}

if ($DryRun) {
    Write-Output "DRY RUN - nothing changed."
} else {
    Write-Output "Install complete. Restart Claude Code to pick up changes."
}
