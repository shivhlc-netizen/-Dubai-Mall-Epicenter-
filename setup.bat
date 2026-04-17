@echo off
setlocal enabledelayedexpansion
title Dubai Mall — Setup
cd /d "%~dp0"

echo.
echo  ==========================================
echo   THE DUBAI MALL — THE EPICENTER
echo   Full-Stack Setup Script (Port 5001)
echo  ==========================================
echo.

:: ── 1. Check Node.js ────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Download from https://nodejs.org/
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js !NODE_VER!

:: ── 2. Check npm ────────────────────────────────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found.
    pause & exit /b 1
)
echo [OK] npm found

:: ── 3. Check MySQL client ────────────────────────────────────────────────────
where mysql >nul 2>&1
if errorlevel 1 (
    echo [INFO] mysql CLI not in PATH (using Node.js for DB ops instead)
) else (
    echo [OK] mysql CLI found
)

:: ── 4. Create .env if missing ────────────────────────────────────────────────
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] .env created from .env.example — edit credentials if needed
    ) else (
        echo [WARN] No .env or .env.example found
    )
) else (
    echo [OK] .env already exists
)

:: ── 5. Install npm dependencies ──────────────────────────────────────────────
echo.
echo [SETUP] Installing npm dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [ERROR] npm install failed
    pause & exit /b 1
)
echo [OK] Dependencies installed

:: ── 6. Copy images to public/gallery ─────────────────────────────────────────
echo.
echo [SETUP] Copying Dubai Mall images to public\gallery\...
if not exist "public\gallery" mkdir "public\gallery"

set COUNT=0
if exist "image\" (
    for %%e in (jpg png webp jpeg gif) do (
        for %%f in ("image\*.%%e") do (
            if exist "%%f" (
                copy "%%f" "public\gallery\" /Y >nul 2>&1
                set /a COUNT+=1
            )
        )
    )
)
if exist "image\dm\Dubai M\" (
    for %%e in (jpg png webp jpeg gif) do (
        for %%f in ("image\dm\Dubai M\*.%%e") do (
            if exist "%%f" (
                copy "%%f" "public\gallery\" /Y >nul 2>&1
                set /a COUNT+=1
            )
        )
    )
)
echo [OK] !COUNT! images copied to public\gallery\

:: ── 7. Setup Database ─────────────────────────────────────────────────────────
echo.
set /p RUN_DB=Setup database now? (Schema + Seed) [y/N]:
if /i "!RUN_DB!"=="y" (
    echo [INFO] Running database initialization...
    node database/init-db.js
    if errorlevel 1 (
        echo [ERROR] DB init failed — check MySQL is running and .env credentials are correct.
        pause & exit /b 1
    )
    echo [INFO] Seeding database...
    node database/seed.js
    if errorlevel 1 (
        echo [WARN] Seed had warnings — DB may still be usable.
    ) else (
        echo [OK] Database fully setup and seeded.
    )
) else (
    echo [SKIP] Database setup skipped.
)

:: ── 8. Sync gallery images to DB ──────────────────────────────────────────────
echo.
echo [INFO] Gallery images will be auto-synced on first run via /api/gallery/sync

:: ── 9. Start dev server ────────────────────────────────────────────────────────
echo.
echo  ==========================================
echo   SETUP COMPLETE
echo  ==========================================
echo.
echo   Site URL  : http://localhost:5001
echo   Login URL : http://localhost:5001/login
echo   Admin URL : http://localhost:5001/admin
echo.
echo   Default Admin : (set ADMIN_EMAIL in .env)
echo   Password      : (set ADMIN_PASSWORD in .env)
echo.
set /p START_DEV=Start development server on Port 5001? [y/N]:
if /i "!START_DEV!"=="y" (
    echo [INFO] Starting server on http://localhost:5001 ...
    echo.
    start "" cmd /c "timeout /t 5 >nul && start http://localhost:5001"
    call npm run dev -- -p 5001
)

pause
endlocal
