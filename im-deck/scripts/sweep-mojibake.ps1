<#
.SYNOPSIS
  Repair UTF-8 mojibake in a self-contained HTML deck. Use after Edit-tool
  modifications that round-tripped UTF-8 through CP1252.

.PARAMETER DeckPath
  Absolute path to the HTML file to repair.
#>
param([Parameter(Mandatory=$true)] [string] $DeckPath)

if (-not (Test-Path $DeckPath)) { throw "DeckPath not found: $DeckPath" }
$utf8 = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($DeckPath, $utf8)

# Each key: the mojibaked sequence as PowerShell-safe char codes.
# Each value: the correct single Unicode char.
$map = @{}
$map[ [string]::new(@([char]0xE2, [char]0x201A, [char]0xAC)) ]    = [string][char]0x20AC  # €
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0xA6)) ]    = [string][char]0x2026  # …
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0xA2)) ]    = [string][char]0x2022  # •
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0x201C)) ]  = [string][char]0x2014  # — em dash
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0x201D)) ]  = [string][char]0x2013  # – en dash
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0x2122)) ]  = [string][char]0x2019  # '
$map[ [string]::new(@([char]0xE2, [char]0x20AC, [char]0x0153)) ]  = [string][char]0x201C  # "
$map[ [string]::new(@([char]0xE2, [char]0x20AC)) ]                = [string][char]0x201D  # " (catch-all)
$map[ [string]::new(@([char]0xC2, [char]0xB7)) ]                  = [string][char]0x00B7  # ·
$map[ [string]::new(@([char]0xC3, [char]0x97)) ]                  = [string][char]0x00D7  # ×

$total = 0
foreach ($k in $map.Keys) {
  $hits = ([regex]::Matches($content, [regex]::Escape($k))).Count
  if ($hits -gt 0) {
    Write-Host ("Replaced {0} occurrences of {1}-byte mojibake" -f $hits, $k.Length) -ForegroundColor Yellow
    $total += $hits
    $content = $content.Replace($k, $map[$k])
  }
}

[System.IO.File]::WriteAllText($DeckPath, $content, $utf8)
Write-Host ("Total sweeps: {0}. File saved as UTF-8 (no BOM)." -f $total) -ForegroundColor Green
