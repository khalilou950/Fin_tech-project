@echo off
echo ====================================
echo  MongoDB Connection Fix - Finovia
echo ====================================
echo.

REM Vérifier si .env.local existe
if not exist .env.local (
    echo [!] Fichier .env.local manquant
    echo [+] Creation du fichier .env.local...
    
    if exist .env.example (
        copy .env.example .env.local
        echo [OK] Fichier .env.local cree depuis .env.example
    ) else (
        echo MONGODB_URI=mongodb://127.0.0.1:27017/pocketguard-ai > .env.local
        echo JWT_SECRET=your-super-secret-jwt-key-change-this >> .env.local
        echo NODE_ENV=development >> .env.local
        echo [OK] Fichier .env.local cree avec configuration par defaut
    )
    echo.
)

echo [1] Verification de MongoDB...
echo.

REM Vérifier si MongoDB est installé
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] MongoDB n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Options:
    echo 1. Installer MongoDB Community: https://www.mongodb.com/try/download/community
    echo 2. Utiliser MongoDB Atlas cloud: https://www.mongodb.com/cloud/atlas/register
    echo.
    echo Consultez MONGODB_FIX.md pour plus d'informations
    pause
    exit /b 1
)

echo [OK] MongoDB est installe
echo.

echo [2] Demarrage de MongoDB...
echo.

REM Essayer de démarrer le service MongoDB
net start MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Service MongoDB demarre avec succes
) else (
    echo [!] Impossible de demarrer le service MongoDB
    echo.
    echo Essayez manuellement:
    echo   1. Ouvrez PowerShell en tant qu'administrateur
    echo   2. Executez: net start MongoDB
    echo.
    echo Ou demarrez MongoDB manuellement:
    echo   mongod --dbpath C:\data\db
    echo.
)
echo.

echo [3] Test de connexion MongoDB...
echo.

node check-mongodb-connection.js
if %errorlevel% neq 0 (
    echo.
    echo [!] Echec du test de connexion
    echo.
    echo Consultez MONGODB_FIX.md pour resoudre les problemes
    pause
    exit /b 1
)

echo.
echo ====================================
echo  Tout est pret!
echo ====================================
echo.
echo Vous pouvez maintenant demarrer l'application:
echo   npm run dev
echo.
pause
