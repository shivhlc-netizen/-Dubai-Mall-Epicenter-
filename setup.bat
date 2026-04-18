@echo off
setlocal enabledelayedexpansion
title THE DUBAI MALL — SETUP WIZARD
color 0B

echo.
echo  ==========================================================================
echo   THE DUBAI MALL — THE EPICENTER
echo   7-Star Architectural Setup & Governance Script
echo  ==========================================================================
echo.

:: ── 1. SYSTEM CHECKS ────────────────────────────────────────────────────────
echo [SYSTEM] Verifying Node.js environment...
where node >nul 2>&1 || (echo [ERR] Node.js missing! & pause & exit /b 1)
where npm >nul 2>&1 || (echo [ERR] npm missing! & pause & exit /b 1)
echo [OK] Node.js & npm detected.

:: ── 2. CONFIGURATION ────────────────────────────────────────────────────────
echo [ENV] Checking configuration files...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] .env generated from template.
    ) else (
        echo [ERR] Critical: .env.example missing!
        pause & exit /b 1
    )
) else (
    echo [OK] .env already exists.
)

:: ── 3. INSTALLATION ─────────────────────────────────────────────────────────
if not exist "node_modules\" (
    echo [SETUP] Installing 7-star dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERR] npm install failed!
        pause & exit /b 1
    )
) else (
    echo [OK] Dependencies ready.
)

:: ── 4. DATABASE & GOVERNANCE ────────────────────────────────────────────────
echo.
set /p DB_OP="Full Database Reset? (Schema + Seed + API Budgets) [y/N]: "
if /i "!DB_OP!"=="y" (
    echo [DB] Establishing Schema...
    node database/init-db.js
    if errorlevel 1 (
        echo [ERR] DB Initialization failed! Check MySQL service.
        pause & exit /b 1
    )
    echo [DB] Seeding Core Data (Users, Categories, Images)...
    node database/seed.js
    
    echo [DB] Applying API Governance Migrations...
    :: Inline temporary migration for budgets if needed
    node -e "const mysql=require('mysql2/promise');const fs=require('fs');async function m(){const env={};if(fs.existsSync('.env')){fs.readFileSync('.env','utf8').split('\n').forEach(l=>{const [k,...v]=l.split('=');if(k&&!k.startsWith('#')&&v.length)env[k.trim()]=v.join('=').trim().replace(/^['\"]|['\"]$/g,'');});}const p=mysql.createPool({host:env.DB_HOST||'127.0.0.1',port:parseInt(env.DB_PORT||'3306'),user:env.DB_USER||'root',password:env.DB_PASSWORD||'',database:env.DB_NAME||'dubai_mall'});try{const [c]=await p.execute('SHOW COLUMNS FROM users');const n=c.map(x=>x.Field);if(!n.includes('api_budget')) await p.execute('ALTER TABLE users ADD COLUMN api_budget INT NOT NULL DEFAULT 1000');if(!n.includes('api_used')) await p.execute('ALTER TABLE users ADD COLUMN api_used INT NOT NULL DEFAULT 0');if(!n.includes('last_api_request')) await p.execute('ALTER TABLE users ADD COLUMN last_api_request TIMESTAMP NULL');console.log('✓ Governance active.');}catch(e){console.error('✗ Migration failed:',e.message);}finally{await p.end();}}m();"
)

:: ── 5. ASSET SYNC ──────────────────────────────────────────────────────────
echo.
echo [IMAGE] Synchronizing high-definition assets...
if not exist "public\gallery\" mkdir "public\gallery\"
if exist "image\" (
    xcopy /y /q "image\*.jpg" "public\gallery\" >nul 2>&1
    xcopy /y /q "image\*.png" "public\gallery\" >nul 2>&1
    xcopy /y /q "image\*.webp" "public\gallery\" >nul 2>&1
)
echo [OK] Image synchronization complete.

:: ── 6. SUMMARY ──────────────────────────────────────────────────────────────
echo.
echo  ==========================================================================
echo   SETUP COMPLETE — PROJECT STABILIZED
echo  ==========================================================================
echo.
echo   - Site URL:  http://localhost:5001
echo   - Admin URL: http://localhost:5001/admin
echo.
echo   TEST CREDENTIALS:
echo   - Admin: admin@dubaimall.ae / Admin@Dubai2025!
echo   - Guest: guest@dubaimall.ae / User@Dubai2025!
echo.
echo  ==========================================================================
echo.

set /p LAUNCH="Start Epicenter now? (y/N): "
if /i "!LAUNCH!"=="y" (
    start START_DUBAI_MALL.bat
) else (
    echo [EXIT] Run START_DUBAI_MALL.bat when ready.
    pause
)

endlocal
