@echo off
title 7-Star Global Deployer
echo --------------------------------------------------
echo ⭐ DUBAI SEVEN WONDERS: GOING LIVE GLOBALLY ⭐
echo --------------------------------------------------

echo [1/2] Starting Docker Infrastructure...
docker-compose up -d

echo [2/2] Generating Secure Global Link...
echo Note: Keep this window open to stay live.
echo.
npx trycloudflare --url localhost:3000
pause
