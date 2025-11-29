# Script PowerShell pour démarrer l'application Next.js

Write-Host "🚀 Démarrage de l'application PocketGuard AI..." -ForegroundColor Cyan
Write-Host ""

# Aller dans le bon dossier
$projectPath = "C:\Users\bennabi\Downloads\Finovia"
Set-Location $projectPath

Write-Host "📁 Dossier: $projectPath" -ForegroundColor Green
Write-Host ""

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Vérifier si le port 3000 est utilisé
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Le port 3000 est déjà utilisé!" -ForegroundColor Yellow
    Write-Host "   Tentative d'arrêt des processus Node.js..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host ""
}

# Nettoyer le cache Next.js
Write-Host "🧹 Nettoyage du cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}
Write-Host ""

# Démarrer le serveur
Write-Host "▶️  Démarrage du serveur Next.js..." -ForegroundColor Green
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Le serveur va démarrer sur http://localhost:3000" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

npm run dev

