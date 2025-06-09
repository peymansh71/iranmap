Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "      Iran Map Application" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Iran Map Server..." -ForegroundColor Yellow
Write-Host ""

# Check if executable exists
if (Test-Path "iran-map-windows.exe") {
    # Start the server in background
    $serverProcess = Start-Process -FilePath "iran-map-windows.exe" -PassThru -WindowStyle Hidden
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 3
    
    # Open browser
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    
    Write-Host "Iran Map is now running!" -ForegroundColor Green
    Write-Host "Server PID: $($serverProcess.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to stop the server..." -ForegroundColor Yellow
    
    # Wait for user input
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the server
    Write-Host ""
    Write-Host "Stopping server..." -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "Server stopped." -ForegroundColor Red
} else {
    Write-Host "Error: iran-map-windows.exe not found!" -ForegroundColor Red
    Write-Host "Please run the build process first." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 