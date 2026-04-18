@echo off
setlocal
title Dubai Mall — Clean Install
cd /d "%~dp0"

echo.
echo  ==========================================
echo   DANGEROUS: CLEAN INSTALL
echo   This will remove node_modules and .next
echo  ==========================================
echo.

set /p CONFIRM="Are you sure? (y/N): "
if /i "%CONFIRM%"=="y" (
    echo [CLEAN] Removing node_modules...
    rmdir /s /q node_modules 2>nul
    echo [CLEAN] Removing .next...
    rmdir /s /q .next 2>nul
    echo [CLEAN] Removing package-lock.json...
    del /f /q package-lock.json 2>nul
    
    echo [INSTALL] Reinstalling dependencies...
    call npm install --legacy-peer-deps
    
    echo.
    echo [SUCCESS] Project cleaned and reinstalled.
) else (
    echo [CANCEL] Operation aborted.
)

pause
