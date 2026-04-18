@echo off
title 7-Star Project Shrinker
echo --------------------------------------------------
echo ⭐ DUBAI SEVEN WONDERS: DISK OPTIMIZER ⭐
echo --------------------------------------------------

echo [1/4] Pruning Docker Build Cache...
echo (This removes unused layers from previous builds)
docker builder prune -f

echo [2/4] Removing Unused Docker Images...
docker image prune -f

echo [3/4] Clearing Next.js Build Cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder cleared.
)

echo [4/4] Removing TeX and Log Junk...
del /q *.log *.aux *.out *.synctex.gz *.toc 2>nul

echo.
echo --------------------------------------------------
echo ✅ OPTIMIZATION COMPLETE
echo Run 'START_DUBAI_MALL.bat' or 'GO_LIVE_GLOBAL.bat' 
echo to rebuild only what is necessary.
echo --------------------------------------------------
pause
