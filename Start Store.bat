@echo off
title Obis XI Vault
cd /d "%~dp0"
echo.
echo   OBIS XI VAULT - starting your store...
echo.
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org and run this again. & pause & exit /b 1)
if not exist node_modules (echo Installing packages, this takes a few minutes the first time... & call npm install || (pause & exit /b 1))
if not exist .setup-done (call npm run setup || (pause & exit /b 1))
echo   Store:  http://localhost:3000
echo   Admin:  http://localhost:3000/admin
echo   Close this window to stop the site.
echo.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
pause
