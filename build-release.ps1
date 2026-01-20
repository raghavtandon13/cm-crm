# ================= CONFIG =================
$AppName = "crm"
$ReleasesDir = "releases"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$ReleaseDir = Join-Path $ReleasesDir $Timestamp

Write-Host "🚀 Building $AppName standalone release" -ForegroundColor Cyan
Write-Host "📦 Release: $ReleaseDir"

# ================= BUILD =================
Write-Host "→ Running build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Build failed"
    exit 1
}

# ================= CREATE DIR =================
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

# ================= COPY STANDALONE =================
Write-Host "→ Copying standalone server"
Copy-Item ".next/standalone/*" $ReleaseDir -Recurse -Force

# ================= COPY STATIC =================
Write-Host "→ Copying static assets"
New-Item -ItemType Directory -Force -Path "$ReleaseDir/.next" | Out-Null
Copy-Item ".next/static" "$ReleaseDir/.next/" -Recurse -Force

# ================= COPY PUBLIC =================
if (Test-Path "public") {
    Write-Host "→ Copying public/"
    Copy-Item "public" "$ReleaseDir/" -Recurse -Force
}

# ================= COPY ENV (OPTIONAL) =================
if (Test-Path ".env") {
    Write-Host "→ Copying .env"
    Copy-Item ".env" "$ReleaseDir/"
}

Write-Host "✅ Release ready!" -ForegroundColor Green
Write-Host ""
Write-Host "▶ Run locally with:" -ForegroundColor Yellow
Write-Host "   cd $ReleaseDir"
Write-Host "   node server.js"

