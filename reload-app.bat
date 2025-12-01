@echo off
echo.
echo ========================================
echo   Przeladowanie aplikacji LowCarb Planer
echo ========================================
echo.

echo [1/3] Zatrzymywanie Next.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Czyszczenie cache...
rmdir /s /q .next >nul 2>&1
rmdir /s /q node_modules\.cache >nul 2>&1

echo [3/3] Uruchamianie Next.js z czystym cache...
echo.
echo Aplikacja zostanie uruchomiona za chwile...
echo Strona: http://localhost:3000
echo.

call npm run dev

echo.
echo Gotowe!
pause
