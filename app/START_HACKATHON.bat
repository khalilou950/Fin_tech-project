@echo off
echo ========================================
echo   DEMARRAGE RAPIDE - HACKATHON
echo ========================================
echo.

cd /d "C:\Users\bennabi\Downloads\Finovia"

echo [1/3] Arret des processus Node.js...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Nettoyage du cache...
if exist .next rmdir /s /q .next

echo [3/3] Demarrage du serveur sur le port 3001...
echo.
echo ========================================
echo   Le serveur va demarrer sur:
echo   http://localhost:3001
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

npm run dev -- -p 3001

pause

