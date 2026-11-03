@echo off
title CoviTrack - One-Click Application Launcher
cd /d "%~dp0"

echo =====================================================================
echo        COVITRACK - ONE-CLICK APPLICATION LAUNCHER
echo =====================================================================
echo.
echo Starting CoviTrack with automated environment and database verification...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Launcher Error] An error occurred while launching CoviTrack.
    pause
)
