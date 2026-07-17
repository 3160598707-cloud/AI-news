# 下载地球贴图 - jsDelivr CDN 国内可访问
Write-Host "Downloading earth texture..." -ForegroundColor Cyan

$url = "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
$outDir = Join-Path $PSScriptRoot "..\public"
$outFile = Join-Path $outDir "earth-dark.jpg"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

try {
    Invoke-WebRequest -Uri $url -OutFile $outFile -TimeoutSec 30
    Write-Host "SUCCESS: earth-dark.jpg downloaded to public/" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    Write-Host "Try downloading manually from: $url" -ForegroundColor Yellow
}
