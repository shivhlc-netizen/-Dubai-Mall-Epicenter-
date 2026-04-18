@echo off
setlocal enabledelayedexpansion
title THE DUBAI MALL — EPICENTER PRO
color 0E

:: ── CONFIGURATION ──────────────────────────────────────────────────────────
set PORT=5001
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

cls
echo.
echo  ##########################################################################
echo  #                                                                        #
echo  #                 THE DUBAI MALL — THE EPICENTER PRO                     #
echo  #                    7-STAR ARCHITECTURAL DASHBOARD                      #
echo  #                                                                        #
echo  ##########################################################################
echo.
echo   Environment: Development
echo   Directory:   %PROJECT_DIR%
echo   Primary Port: %PORT%
echo.

:: ── 1. PORT GUARD (AUTO-CLEAR) ──────────────────────────────────────────────
echo [SYSTEM] Checking Port %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    if not "%%a"=="" (
        echo [WARN] Port %PORT% is blocked by PID %%a.
        echo [INFO] Clearing port for 7-star stability...
        taskkill /PID %%a /F >nul 2>&1
        timeout /t 2 >nul
    )
)
echo [OK] Port %PORT% is ready.

:: ── 2. SYSTEM CHECKS ────────────────────────────────────────────────────────
echo [SYSTEM] Verifying dependencies...

where node >nul 2>&1 || (echo [ERROR] Node.js not found! & pause & exit /b 1)
where npm >nul 2>&1 || (echo [ERROR] npm not found! & pause & exit /b 1)

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] .env generated from example.
    ) else (
        echo [ERROR] .env.example missing!
        pause & exit /b 1
    )
)

:: ── 3. INSTALLATION CHECK ───────────────────────────────────────────────────
if not exist "node_modules\" (
    echo [SETUP] First-time setup: Installing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed!
        pause & exit /b 1
    )
    echo [OK] Dependencies installed.
)

:: ── 4. LAUNCH ───────────────────────────────────────────────────────────────
echo.
echo  ==========================================================================
echo   ACCESS DETAILS
echo  ==========================================================================
echo   URL:    http://localhost:%PORT%
echo   Login:  admin@dubaimall.ae
echo   Pass:   Admin@Dubai2025! (from .env)
echo  ==========================================================================
echo.

set /p START_NOW="Launch Dev Server Now? (y/N): "
if /i "!START_NOW!"=="y" (
    echo [LAUNCH] Starting Next.js on port %PORT%...
    :: Start browser after delay
    start "" cmd /c "timeout /t 8 >nul && start http://localhost:%PORT%"
    
    :: Run Next.js and capture output for stability monitoring
    call npm run dev -- -p %PORT%
    if errorlevel 1 (
        echo.
        echo [CRITICAL] Server crashed or stopped unexpectedly.
        echo [INFO] Try running CLEAN_INSTALL.bat if this persists.
        pause
    )
) else (
    echo [EXIT] Setup complete. Run this script again to start the server.
    pause
)

endlocal
