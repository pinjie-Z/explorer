@echo off
setlocal
title Explorer Server

cd /d "%~dp0"

echo ========================================================
echo   Explorer - Local Server
echo   URL:    http://localhost:8080
echo   Backup: explorer-data.json (same folder)
echo ========================================================
echo.

set PY=
where python >nul 2>nul && set PY=python
if not defined PY where py >nul 2>nul && set PY=py
if not defined PY where python3 >nul 2>nul && set PY=python3

if not defined PY (
    echo [ERROR] Python not found. Please install Python 3 first.
    echo         https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Using: %PY%
echo.

REM --- 用一个新的最小化窗口启动服务器 ---
start "Explorer Server" /min cmd /c ""%PY%" server.py"

REM --- 等服务器起来，再开浏览器（只开一次） ---
timeout /t 3 /nobreak >nul
start "" "http://localhost:8080"

REM --- 当前这个窗口直接退出，不再留着 ---
exit /b