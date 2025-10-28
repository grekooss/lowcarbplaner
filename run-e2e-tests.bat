@echo off
REM =====================================================================
REM Prosty skrypt BAT do uruchamiania testow E2E
REM =====================================================================
REM Uzycie:
REM   run-e2e-tests.bat            - Wszystkie testy headless
REM   run-e2e-tests.bat headed     - Z widoczna przegladarka
REM   run-e2e-tests.bat ui         - Tryb UI (interaktywny)
REM   run-e2e-tests.bat login      - Tylko test login
REM =====================================================================

echo.
echo ========================================
echo   Playwright E2E Tests - LowCarbPlaner
echo ========================================
echo.

REM Sprawdz, czy .env.e2e istnieje
if not exist ".env.e2e" (
    echo [ERROR] Brak pliku .env.e2e!
    echo Skopiuj .env.e2e.example do .env.e2e i wypelnij dane
    exit /b 1
)

REM Sprawdz argument
set MODE=%1

if "%MODE%"=="ui" (
    echo [INFO] Uruchamiam tryb UI ^(interaktywny^)...
    echo.
    npx playwright test --ui
    goto end
)

if "%MODE%"=="headed" (
    echo [INFO] Uruchamiam z widoczna przegladarka...
    echo.
    npx playwright test tests/e2e/auth/login.spec.ts --headed --project=chromium --reporter=list
    goto end
)

if "%MODE%"=="login" (
    echo [INFO] Uruchamiam test login...
    echo.
    npx playwright test tests/e2e/auth/login.spec.ts --project=chromium --reporter=list
    goto end
)

if "%MODE%"=="" (
    echo [INFO] Uruchamiam wszystkie testy ^(headless^)...
    echo.
    npx playwright test tests/e2e --project=chromium --reporter=list
    goto end
)

REM Jesli podano nazwe testu
echo [INFO] Uruchamiam test: %MODE%
echo.
npx playwright test tests/e2e/**/*%MODE%*.spec.ts --project=chromium --reporter=list

:end
echo.
echo ========================================
echo   Zakonczono
echo ========================================
echo.

REM Zapytaj o raport
if "%MODE%" neq "ui" (
    set /p SHOW_REPORT="Otworzyc raport HTML? (t/n): "
    if /i "%SHOW_REPORT%"=="t" (
        npx playwright show-report
    )
)
