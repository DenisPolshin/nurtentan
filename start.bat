@echo off
:: Устанавливаем кодировку UTF-8
chcp 65001 > nul

echo ==========================================
echo    Zapusk proekta kp-kz
echo ==========================================
echo.

:: Переходим в папку с приложением
cd /d "%~dp0app"

if exist "package.json" (
    echo [INFO] package.json nayden. Zapusk...
) else (
    echo [ERROR] package.json ne nayden v papke app!
    echo Tekushchaya papka: %cd%
    pause
    exit
)

echo.
echo [1/2] Ustanovka zavisimostey...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Oshibka pri ustanovke zavisimostey.
    pause
    exit
)

echo.
echo [2/2] Start servera...
echo Proekt budet dostupen po adresu: http://localhost:3005
echo.

call npm run dev

pause
