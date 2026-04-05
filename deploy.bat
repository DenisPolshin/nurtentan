@echo off
chcp 65001 >nul
echo =======================================================
echo                 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ                  
echo =======================================================
echo.

:: 1. Проверка изменений и пуш в GitHub
echo [1/3] Отправка изменений в GitHub...
git add .
git commit -m "Auto-deploy update"
git push
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Не удалось отправить изменения в GitHub. Проверьте git status.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Изменения отправлены.
echo.

:: 2. Выполнение команд на сервере по SSH
echo [2/3] Подключение к серверу и обновление кода...
:: Включаем режим обслуживания (создаем флаг maintenance.flag)
ssh -i "%USERPROFILE%\.ssh\id_ed25519" -o IdentitiesOnly=yes -o PasswordAuthentication=no root@212.227.191.121 "touch /opt/nurtentan/maintenance.flag && bash -c 'cd /opt/nurtentan && git reset --hard origin/main && git pull'"
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Не удалось обновить код на сервере.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Код на сервере обновлен.
echo.

:: 3. Сборка и перезапуск на сервере
echo [3/3] Сборка проекта и перезапуск PM2...
:: Выполняем все команды деплоя и в самом конце удаляем флаг maintenance.flag
ssh -i "%USERPROFILE%\.ssh\id_ed25519" -o IdentitiesOnly=yes -o PasswordAuthentication=no root@212.227.191.121 "bash -c 'cd /opt/nurtentan/app && npm install && node scripts/seed-verbs.js && node scripts/translate-sentences.js && npm run build && pm2 restart kp-app' && rm -f /opt/nurtentan/maintenance.flag"
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Ошибка при сборке или перезапуске приложения.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Приложение успешно собрано и перезапущено!
echo.

echo =======================================================
echo                  ДЕПЛОЙ ЗАВЕРШЕН                       
echo =======================================================
echo Проверьте сайт: https://nurtentan.de
pause
