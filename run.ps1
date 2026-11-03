# ==============================================================================
# CoviTrack - Universal One-Click Runner (Windows PowerShell)
# Automatically initializes Database, Migrations, Backend, Frontend & Launches Browser
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "       COVITRACK - AUTOMATED HEALTH AND TESTING MANAGEMENT SYSTEM     " -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 1. Check Node.js and NPM
Write-Host "[1/6] Verifying Node.js environment..." -ForegroundColor Yellow
try {
    $nodeVer = & node -v
    $npmVer = & npm -v
    Write-Host "      Node.js: $nodeVer | npm: $npmVer" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ and retry." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

# 2. Check / Start MySQL Database
Write-Host "[2/6] Verifying MySQL database on 127.0.0.1:3306..." -ForegroundColor Yellow

$isPort3306Open = $false
try {
    $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue
    $isPort3306Open = $tcp.TcpTestSucceeded
} catch {
    $isPort3306Open = $false
}

if ($isPort3306Open) {
    Write-Host "      MySQL is already active and listening on port 3306." -ForegroundColor Green
} else {
    Write-Host "      MySQL not active on port 3306. Attempting auto-start..." -ForegroundColor Yellow
    
    $mysqldPath = Join-Path $ScriptDir "bin\mysql\bin\mysqld.exe"
    $myIniPath = Join-Path $ScriptDir "bin\mysql\my.ini"
    $dataDir = Join-Path $ScriptDir "bin\mysql\data"

    # If portable MySQL is not downloaded yet, download it automatically
    if (-not (Test-Path $mysqldPath)) {
        Write-Host "      Portable MySQL not found. Downloading zero-install MariaDB/MySQL engine (85MB)..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path (Join-Path $ScriptDir "bin") | Out-Null
        $zipPath = Join-Path $ScriptDir "bin\mariadb.zip"
        $downloadUrl = "https://archive.mariadb.org/mariadb-10.6.16/winx64-packages/mariadb-10.6.16-winx64.zip"
        
        curl.exe -L -o $zipPath $downloadUrl
        Write-Host "      Extracting database engine..." -ForegroundColor Cyan
        Expand-Archive -Path $zipPath -DestinationPath (Join-Path $ScriptDir "bin\temp") -Force
        $extracted = Get-ChildItem (Join-Path $ScriptDir "bin\temp") | Select-Object -First 1
        Move-Item $extracted.FullName (Join-Path $ScriptDir "bin\mysql") -Force
        Remove-Item $zipPath, (Join-Path $ScriptDir "bin\temp") -Recurse -Force
    }

    if (-not (Test-Path $dataDir)) {
        Write-Host "      Initializing database cluster..." -ForegroundColor Cyan
        & (Join-Path $ScriptDir "bin\mysql\bin\mariadb-install-db.exe") "--datadir=$dataDir" | Out-Null
    }

    if (-not (Test-Path $myIniPath)) {
        $iniContent = @"
[mysqld]
port=3306
basedir="$($ScriptDir.Replace('\','/'))/bin/mysql"
datadir="$($ScriptDir.Replace('\','/'))/bin/mysql/data"
bind-address=127.0.0.1
default_storage_engine=InnoDB
max_connections=50
innodb_buffer_pool_size=64M
"@
        Set-Content -Path $myIniPath -Value $iniContent
    }

    # Start Portable MySQL
    Write-Host "      Starting portable MySQL server in background..." -ForegroundColor Cyan
    $mysqlProc = Start-Process -FilePath $mysqldPath -ArgumentList "--defaults-file=$myIniPath", "--console" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3

    $tcpCheck = Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue
    if ($tcpCheck.TcpTestSucceeded) {
        Write-Host "      MySQL started successfully on 127.0.0.1:3306 (PID: $($mysqlProc.Id))." -ForegroundColor Green
    } else {
        Write-Host "      Waiting an extra 2 seconds for MySQL to ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

# 3. Check and Install Node Dependencies
Write-Host "[3/6] Verifying project dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ScriptDir "node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "client\node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "server\node_modules"))) {
    Write-Host "      Installing project dependencies (one-time setup)..." -ForegroundColor Cyan
    npm run install:all
} else {
    Write-Host "      Dependencies verified." -ForegroundColor Green
}

# 4. Run Migrations & Seed Default Records
Write-Host "[4/6] Initializing relational schema & admin credentials..." -ForegroundColor Yellow
& npm run db:migrate
& npm run seed:admin
& npm run seed:slots

# 5. Build/Verify Client & Server
Write-Host "[5/6] Verifying build artifacts..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ScriptDir "server\dist\server.js"))) {
    Write-Host "      Building backend server..." -ForegroundColor Cyan
    npm run build:server
}
if (-not (Test-Path (Join-Path $ScriptDir "client\dist\index.html"))) {
    Write-Host "      Building frontend client..." -ForegroundColor Cyan
    npm run build:client
}
Write-Host "      Builds verified." -ForegroundColor Green

# 6. Launch Application
Write-Host "[6/6] Launching CoviTrack Application..." -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Web Application:  http://127.0.0.1:5173" -ForegroundColor White
Write-Host "  REST API Backend: http://127.0.0.1:5000" -ForegroundColor White
Write-Host "  Admin Login:      admin@covitrack.local / AdminPass123!" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "Starting servers... Press Ctrl+C in this terminal to stop." -ForegroundColor Gray

# Open browser after a brief delay
Start-Process "http://127.0.0.1:5173"

# Start Frontend & Backend
npm run dev
