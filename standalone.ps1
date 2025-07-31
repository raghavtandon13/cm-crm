$ErrorActionPreference = "Stop"

Write-Host "🧹 Removing .next folder..."
Remove-Item -Recurse -Force .next

Write-Host "🔨 Building Next.js app..."
npm run build

Write-Host "📦 Moving standalone output to crm/..."
Move-Item -Path ".next/standalone" -Destination "crm"

Write-Host "📁 Copying public/ to crm/public/..."
Copy-Item -Recurse -Force public crm\public

