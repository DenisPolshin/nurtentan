@echo off
set SERVER_IP=212.227.191.121
set PROJECT_DIR=/opt/nurtentan
set SSH_KEY="%USERPROFILE%\.ssh\id_ed25519"

echo =======================================================
echo                 AUTOMATIC DEPLOY
echo =======================================================
echo.

:: 1. Git push
echo [1/3] Sending changes to GitHub...
git add .
git commit -m "Auto-deploy update"
git push
echo [OK] Changes sent.
echo.

:: 2. Update code on server
echo [2/3] Updating code on server...
ssh -i %SSH_KEY% -o IdentitiesOnly=yes -o PasswordAuthentication=no root@%SERVER_IP% "cd %PROJECT_DIR% && git reset --hard origin/main && git pull"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to update code on server.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Code updated.
echo.

:: 3. Build and restart
echo [3/3] Building project and restarting application...
ssh -i %SSH_KEY% -o IdentitiesOnly=yes -o PasswordAuthentication=no root@%SERVER_IP% "bash -c 'cd %PROJECT_DIR%/app && npm install && node scripts/seed-verbs.js && node scripts/translate-sentences.js && npm run build && pm2 restart kp-app'"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error during build or restart.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Project built and restarted!
echo.

echo =======================================================
echo                  DEPLOY COMPLETED
echo =======================================================
echo Site: https://nurtentan.de
echo.
pause
