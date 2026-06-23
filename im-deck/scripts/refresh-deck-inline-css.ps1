<#
.SYNOPSIS
  Regenerates the inline <style>...</style> block in a self-contained IM_ deck HTML
  from the current im-deck/references/im-styles.css. UTF-8 safe on both read + write.

.PARAMETER DeckPath
  Absolute path to the self-contained deck HTML (the one with <style>...</style> inlined).

.PARAMETER CssPath
  Absolute path to the source im-styles.css. Defaults to the synced copy at
  ~/.claude/skills/im-deck/references/im-styles.css if not given.

.EXAMPLE
  pwsh refresh-deck-inline-css.ps1 -DeckPath "C:\path\to\deck.html"
#>
param(
  [Parameter(Mandatory=$true)] [string] $DeckPath,
  [string] $CssPath = "$env:USERPROFILE\.claude\skills\im-deck\references\im-styles.css"
)

if (-not (Test-Path $DeckPath)) { throw "DeckPath not found: $DeckPath" }
if (-not (Test-Path $CssPath))  { throw "CssPath not found:  $CssPath"  }

# Read both files as raw bytes, decode as UTF-8 explicitly.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$cssNew = [System.IO.File]::ReadAllText($CssPath, $utf8NoBom)
$deck   = [System.IO.File]::ReadAllText($DeckPath, $utf8NoBom)

# Match the FIRST <style>...</style> block only. (?s) = dotall mode in .NET regex.
$pattern  = '(?s)<style[^>]*>.*?</style>'
$replacement = '<style>' + ($cssNew -replace '\$', '$$$$') + '</style>'
$updated  = [System.Text.RegularExpressions.Regex]::Replace($deck, $pattern, $replacement, 1)

# Verify a swap happened -- fail loud rather than silently no-op
if ($updated -eq $deck) {
  throw "No <style>...</style> block found in $DeckPath; nothing was changed."
}

# Write back as UTF-8 WITHOUT BOM. Set-Content's defaults vary by PS version; using
# the .NET helper is the only fully-portable safe path.
[System.IO.File]::WriteAllText($DeckPath, $updated, $utf8NoBom)

Write-Host "Refreshed inline <style> in $DeckPath ($($cssNew.Length) chars of CSS)" -ForegroundColor Green
