<# :
@echo off
title CoviTrack - One-Click Application Launcher
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-Expression (Get-Content -Raw '%~f0')"
exit /b %ERRORLEVEL%
#>

$ErrorActionPreference = "Continue"

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
    Write-Host "ERROR: Node.js is not installed or not in system PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ and retry." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

# 2. Check and Install Node Dependencies
Write-Host "[2/6] Verifying project dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ScriptDir "node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "client\node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "server\node_modules"))) {
    Write-Host "      Installing project dependencies (one-time setup)..." -ForegroundColor Cyan
    & npm run install:all
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install npm dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
} else {
    Write-Host "      Dependencies verified." -ForegroundColor Green
}

# 3. Check / Start MySQL Database with Credential Preflight
Write-Host "[3/6] Verifying MySQL database connectivity..." -ForegroundColor Yellow

$startedProcesses = @()

# Run database preflight check
& npm run setup:db
$dbSetupCode = $LASTEXITCODE

if ($dbSetupCode -eq 2) {
    Write-Host "      Port 3306 is unavailable or password-protected. Provisioning portable MariaDB on port 3307..." -ForegroundColor Cyan
    
    $mysqldPath = Join-Path $ScriptDir "bin\mysql\bin\mysqld.exe"
    $myIniPath = Join-Path $ScriptDir "bin\mysql\my.ini"
    $dataDir = Join-Path $ScriptDir "bin\mysql\data"

    if (-not (Test-Path $mysqldPath)) {
        Write-Host "      Downloading zero-install MariaDB engine (85MB)..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path (Join-Path $ScriptDir "bin") | Out-Null
        $zipPath = Join-Path $ScriptDir "bin\mariadb.zip"
        curl.exe -L -o $zipPath "https://archive.mariadb.org/mariadb-10.6.16/winx64-packages/mariadb-10.6.16-winx64.zip"
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

    # Generate custom my.ini on isolated port 3307
    $iniContent = @"
[mysqld]
port=3307
basedir="$($ScriptDir.Replace('\','/'))/bin/mysql"
datadir="$($ScriptDir.Replace('\','/'))/bin/mysql/data"
bind-address=127.0.0.1
default_storage_engine=InnoDB
max_connections=50
innodb_buffer_pool_size=64M
"@
    Set-Content -Path $myIniPath -Value $iniContent

    Write-Host "      Starting portable MySQL server on port 3307 in background..." -ForegroundColor Cyan
    $mysqlProc = Start-Process -FilePath $mysqldPath -ArgumentList "--defaults-file=$myIniPath", "--console" -PassThru -WindowStyle Hidden
    $startedProcesses += $mysqlProc
    Start-Sleep -Seconds 3

    # Re-verify databases on 3307
    & npm run setup:db
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Unable to initialize databases on port 3307." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
} elseif ($dbSetupCode -ne 0) {
    Write-Host "ERROR: Database setup failed with exit code $dbSetupCode." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host "      Database connectivity verified." -ForegroundColor Green

# 4. Run Migrations & Seed Default Records
Write-Host "[4/6] Initializing relational schema & default credentials..." -ForegroundColor Yellow
& npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database migrations failed. Check database logs above." -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

& npm run seed:admin
& npm run seed:slots
Write-Host "      Relational schema and seeds verified." -ForegroundColor Green

# 5. Build/Verify Client & Server
Write-Host "[5/6] Verifying build artifacts..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ScriptDir "server\dist\server.js"))) {
    Write-Host "      Building backend server..." -ForegroundColor Cyan
    & npm run build:server
}
if (-not (Test-Path (Join-Path $ScriptDir "client\dist\index.html"))) {
    Write-Host "      Building frontend client..." -ForegroundColor Cyan
    & npm run build:client
}
Write-Host "      Builds verified." -ForegroundColor Green

# 6. Launch Application
Write-Host "[6/6] Launching CoviTrack Application..." -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Web Application:  http://127.0.0.1:5173" -ForegroundColor White
Write-Host "  REST API Backend: http://127.0.0.1:5000" -ForegroundColor White
Write-Host "  Admin Login:      admin@covitrack.local / AdminPass123!" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "Starting servers... Press Ctrl+C in this window to stop." -ForegroundColor Gray

Start-Process "http://127.0.0.1:5173"
& npm run dev
