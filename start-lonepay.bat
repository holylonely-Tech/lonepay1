@echo off
REM LonePay launcher.
REM start-lonepay.ps1 contains the build-freshness guard: it reuses the running
REM Next.js production server only when it is serving the current .next build,
REM and otherwise stops just the verified LonePay-owned process on port 3000
REM before starting a fresh server. This wrapper only forwards the exit code.
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-lonepay.ps1"
set "LONEPAY_EXIT_CODE=%ERRORLEVEL%"
if not "%LONEPAY_EXIT_CODE%"=="0" (
    echo.
    pause
)
endlocal & exit /b %LONEPAY_EXIT_CODE%