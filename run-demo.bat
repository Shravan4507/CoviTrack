@echo off
title CoviTrack - One-Click Live Automation Demonstration and Report Generator
cd /d "%~dp0"

echo =====================================================================
echo    COVITRACK: LIVE AUTOMATED DEMONSTRATION AND REPORT GENERATOR
echo =====================================================================
echo.
echo Launching the automated testing demonstration...
echo Please watch the visible Google Chrome window as it executes.
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-demo.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [Demo Error] An error occurred during the demo execution.
    pause
)
