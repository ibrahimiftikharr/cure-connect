# Frontend Deployment Verification Script
# Run this in PowerShell to verify everything is ready

Write-Host "=== CureConnect Frontend Deployment Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if ($currentDir.Path -notlike "*NEXT-JS-VERSION*") {
    Write-Host "❌ Please run this from d:\Documents\NEXT-JS-VERSION" -ForegroundColor Red
    exit
}

Write-Host "✅ Correct directory" -ForegroundColor Green

# Check .env.production exists
if (Test-Path ".env.production") {
    Write-Host "✅ .env.production exists" -ForegroundColor Green
    Write-Host "   Environment variables configured for Railway services" -ForegroundColor Gray
} else {
    Write-Host "❌ .env.production missing" -ForegroundColor Red
}

# Check .gitignore
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore configured" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore missing" -ForegroundColor Red
}

# Check services folder is excluded
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -like "*services/*") {
    Write-Host "✅ Services folder excluded from git" -ForegroundColor Green
} else {
    Write-Host "⚠️  Services folder not excluded - should be added to .gitignore" -ForegroundColor Yellow
}

# Check package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ package.json missing" -ForegroundColor Red
}

# Check key files
$keyFiles = @("next.config.js", "tsconfig.json", "tailwind.config.ts")
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

# Check src folder
if (Test-Path "src") {
    Write-Host "✅ src folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ src folder missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Railway Service URLs ===" -ForegroundColor Cyan
Write-Host "Auth Service:         https://cureconnect-authservice-production.up.railway.app" -ForegroundColor Gray
Write-Host "Appointment Service:  https://cureconnect-appointmentservice-production.up.railway.app" -ForegroundColor Gray
Write-Host "Notification Service: https://cureconnect-notificationservice-production.up.railway.app" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Create GitHub repo: cureconnect-frontend" -ForegroundColor Yellow
Write-Host "2. Run: git init" -ForegroundColor Yellow
Write-Host "3. Run: git add ." -ForegroundColor Yellow
Write-Host "4. Run: git commit -m 'Ready for Vercel deployment'" -ForegroundColor Yellow
Write-Host "5. Run: git remote add origin https://github.com/YOUR_USERNAME/cureconnect-frontend.git" -ForegroundColor Yellow
Write-Host "6. Run: git push -u origin main" -ForegroundColor Yellow
Write-Host "7. Deploy on Vercel with environment variables from .env.production" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== All checks complete! ===" -ForegroundColor Green
