#!/usr/bin/env pwsh
# Junction each skill folder from the repo into ~/.claude/skills/ for live editing.
# Edits in the repo reflect immediately in Claude Code (no re-install).
# Junctions are NTFS directory mounts - no admin required.
#
# Usage:
#   .\scripts\dev-link.ps1            # create junctions (backs up real folders first)
#   .\scripts\dev-link.ps1 -DryRun    # show what would happen
#   .\scripts\dev-link.ps1 -Undo      # remove junctions (does NOT restore backups - do that manually)

param(
    [switch]$DryRun,
    [switch]$Undo
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$skills = @('im-story', 'im-deck', 'im-edit')
$skillsDir = Join-Path $env:USERPROFILE '.claude\skills'
$backupDir = Join-Path $env:USERPROFILE '.claude\skills.backup'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

foreach ($skill in $skills) {
    $src = Join-Path $repoRoot $skill
    $dst = Join-Path $skillsDir $skill

    if ($Undo) {
        if (Test-Path $dst) {
            $item = Get-Item $dst -Force
            if ($item.LinkType -eq 'Junction') {
                Write-Output "REMOVE JUNCTION: $dst"
                if (-not $DryRun) { (Get-Item $dst).Delete() }
            } else {
                Write-Output "SKIP (not a junction): $dst"
            }
        }
        continue
    }

    if (-not (Test-Path $src)) {
        Write-Error "Source skill not found: $src"
    }

    if (Test-Path $dst) {
        $item = Get-Item $dst -Force
        if ($item.LinkType -eq 'Junction') {
            Write-Output "ALREADY LINKED: $dst (re-creating)"
            if (-not $DryRun) { (Get-Item $dst).Delete() }
        } else {
            $backupPath = Join-Path $backupDir "$skill-$stamp"
            Write-Output "BACKUP: $dst -> $backupPath"
            if (-not $DryRun) {
                if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
                Move-Item -Path $dst -Destination $backupPath
            }
        }
    }

    Write-Output "JUNCTION: $dst -> $src"
    if (-not $DryRun) {
        # cmd /c mklink /J because PowerShell's New-Item -ItemType Junction is flaky pre-5.1
        cmd /c mklink /J "`"$dst`"" "`"$src`"" | Out-Null
    }
}

if ($DryRun) { Write-Output "DRY RUN - nothing changed." }
else { Write-Output "Junctions created. Edits in the repo are live in ~/.claude/skills/." }
