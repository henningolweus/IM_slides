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

# Match the FIRST <style>...</style> block only.
# Use explicit RegexOptions.Singleline — the (?s) inline prefix is unreliable in .NET
# when used at the start of the pattern via the static Replace overload.
$pattern = '<style[^>]*>.*?</style>'
$replacement = '<style>' + ($cssNew -replace '\$', '$$$$') + '</style>'
$opts = [System.Text.RegularExpressions.RegexOptions]::Singleline
$rx = New-Object System.Text.RegularExpressions.Regex($pattern, $opts)

# Check pattern match independently — `$updated -eq $deck` would false-positive when
# the new inline CSS happens to match the existing inline CSS byte-for-byte.
if (-not $rx.IsMatch($deck)) {
  throw "No <style>...</style> block found in $DeckPath; nothing was changed."
}

$updated = $rx.Replace($deck, $replacement, 1)

# Write back as UTF-8 WITHOUT BOM. Set-Content's defaults vary by PS version; using
# the .NET helper is the only fully-portable safe path.
[System.IO.File]::WriteAllText($DeckPath, $updated, $utf8NoBom)

Write-Host "Refreshed inline <style> in $DeckPath ($($cssNew.Length) chars of CSS)" -ForegroundColor Green
