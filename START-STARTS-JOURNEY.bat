@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 18+ and run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing required packages...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
start "STARTS JOURNEY" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "STARTS JOURNEY Website" http://localhost:3000/
