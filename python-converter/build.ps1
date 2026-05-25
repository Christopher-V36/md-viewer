# Compile markitdown_cli.py to a standalone Windows directory bundle and copy
# it into md-viewer/resources/bin/ so electron-builder picks it up as an extraResource.
#
# Run from this folder:
#     cd python-converter
#     .\build.ps1
#
# Requires Python 3.9+ on PATH.
#
# WHY --onedir instead of --onefile:
#   --onefile extracts the entire bundle to a temp _MEI folder on EVERY launch,
#   adding 15-30 s of startup overhead. --onedir keeps files in place, making
#   subsequent launches near-instant (DLLs are already on disk and cached by the OS).

$ErrorActionPreference = "Stop"

Write-Host "==> Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "==> Building markitdown_cli with PyInstaller (--onedir)..." -ForegroundColor Cyan
if (Test-Path "dist\markitdown_cli") { Remove-Item -Recurse -Force "dist\markitdown_cli" }

pyinstaller `
  --onedir `
  --console `
  --clean `
  --noconfirm `
  --name markitdown_cli `
  --collect-data magika `
  --collect-all markitdown `
  --collect-all pymupdf4llm `
  --collect-all pymupdf `
  --hidden-import markitdown.converters `
  markitdown_cli.py

$dest = "..\resources\bin\markitdown_cli"
Write-Host "==> Copying bundle to $dest ..." -ForegroundColor Cyan
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path "..\resources\bin" | Out-Null
Copy-Item "dist\markitdown_cli" $dest -Recurse -Force

$exePath = "$dest\markitdown_cli.exe"
$sizeMb = [math]::Round((Get-Item $exePath).Length / 1MB, 1)
Write-Host ""
Write-Host "[OK] Built: $exePath ($sizeMb MB exe, bundle in $dest)" -ForegroundColor Green
Write-Host "    Test it: .\dist\markitdown_cli\markitdown_cli.exe <input> <output>" -ForegroundColor Gray
