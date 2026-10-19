@echo off
title KAVACH - The Protector Cyber Defense System
echo =======================================================================
echo           KAVACH (THE PROTECTOR) // CYBER DEFENSE WAR ROOM
echo   AI Phishing, Deepfake Multimedia Forensics & God's Eye Geospatial
echo =======================================================================
echo.

echo [1/2] Starting KAVACH FastAPI Intelligence Server on http://127.0.0.1:8000...
start "KAVACH Intelligence Server" cmd /k "cd /d %~dp0backend && python main.py"

timeout /t 2 >nul

echo [2/2] Starting KAVACH Web HUD on http://localhost:5173...
start "KAVACH Web HUD" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All defense matrices online!
echo Opening browser at http://localhost:5173...
timeout /t 3 >nul
start http://localhost:5173
