# find-implement-design.ps1
# Resolves the install path of anthropic-skills:implement-design's icon library
# and writes the path to im-deck's references/.icon-library-path.txt

$base = "$env:APPDATA\Claude\local-agent-mode-sessions\skills-plugin"
$outFile = "C:\Users\heol\.claude\skills\im-deck\references\.icon-library-path.txt"

if (-not (Test-Path $base)) {
  Write-Host "Skills plugin directory not found: $base" -ForegroundColor Yellow
  Write-Host "im-deck will use bundled icon essentials only" -ForegroundColor Yellow
  if (Test-Path $outFile) { Remove-Item $outFile }
  exit 0
}

$candidates = Get-ChildItem -Path $base -Recurse -Directory -Filter 'icons' -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match 'implement-design[\\/]assets[\\/]icons' }

if (-not $candidates) {
  Write-Host "implement-design icon library not found under $base" -ForegroundColor Yellow
  Write-Host "im-deck will use bundled icon essentials only" -ForegroundColor Yellow
  if (Test-Path $outFile) { Remove-Item $outFile }
  exit 0
}

$resolved = ($candidates | Select-Object -First 1).FullName
$resolved | Out-File -FilePath $outFile -Encoding utf8 -NoNewline

Write-Host "Resolved: $resolved" -ForegroundColor Green
Write-Host "Wrote path to: $outFile"
