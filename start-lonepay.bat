@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-lonepay.ps1"
set "LONEPAY_EXIT_CODE=%ERRORLEVEL%"
if not "%LONEPAY_EXIT_CODE%"=="0" (
    echo.
    pause
)
endlocal & exit /b %LONEPAY_EXIT_CODE%
