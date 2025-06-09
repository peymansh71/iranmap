@echo off
echo ==========================================
echo      Iran Map Application
echo ==========================================
echo.
echo Starting Iran Map Server...
echo.

REM Start the server and open browser
start "" http://localhost:3000
iran-map-windows.exe

echo.
echo Server stopped.
pause 