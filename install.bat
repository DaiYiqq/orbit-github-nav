@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js not found.
  echo Please install Node.js 18+ from https://nodejs.org  then run this file again.
  echo.
  pause
  exit /b 1
)

node scripts\install.mjs %*
if errorlevel 1 (
  echo.
  echo [ERROR] Install script failed. See the message above.
  pause
)
