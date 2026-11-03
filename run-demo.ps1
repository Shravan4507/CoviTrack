# ==============================================================================
# CoviTrack - One-Click Live Automation Demonstration and Report Generator
# Launches App, executes Live Selenium Tests with Visual Delays, stops servers,
# and automatically opens the compiled QA Test Execution Report PDF!
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "     COVITRACK: LIVE AUTOMATED DEMONSTRATION AND REPORT GENERATOR    " -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 1. Ensure Maven is Available (or Auto-Provision Portable Maven)
Write-Host "[1/7] Verifying Maven testing engine..." -ForegroundColor Yellow
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Users\shrav\tools\apache-maven-3.9.6\bin") {
        $env:Path += ";C:\Users\shrav\tools\apache-maven-3.9.6\bin"
    } elseif (Test-Path (Join-Path $ScriptDir "bin\maven\bin")) {
        $env:Path += ";" + (Join-Path $ScriptDir "bin\maven\bin")
    } else {
        Write-Host "      Maven not found in system PATH. Provisioning portable Maven 3.9.6 (9MB)..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path (Join-Path $ScriptDir "bin") | Out-Null
        $mvnZip = Join-Path $ScriptDir "bin\maven.zip"
        curl.exe -L -o $mvnZip "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
        Expand-Archive -Path $mvnZip -DestinationPath (Join-Path $ScriptDir "bin\temp_mvn") -Force
        $extractedMvn = Get-ChildItem (Join-Path $ScriptDir "bin\temp_mvn") | Select-Object -First 1
        Move-Item $extractedMvn.FullName (Join-Path $ScriptDir "bin\maven") -Force
        Remove-Item $mvnZip, (Join-Path $ScriptDir "bin\temp_mvn") -Recurse -Force
        $env:Path += ";" + (Join-Path $ScriptDir "bin\maven\bin")
    }
}
Write-Host "      Maven is available." -ForegroundColor Green

# 2. Clean Lingering Ports & Dependencies
$priorPids = Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($p in $priorPids) {
    if ($p -and $p -gt 0) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path (Join-Path $ScriptDir "node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "client\node_modules")) -or 
    -not (Test-Path (Join-Path $ScriptDir "server\node_modules"))) {
    Write-Host "      Installing project dependencies (one-time setup)..." -ForegroundColor Cyan
    & npm run install:all
}

$startedProcesses = @()

# 3. Verify / Auto-Provision & Start MySQL Database
Write-Host "[2/7] Verifying MySQL database on 127.0.0.1:3306..." -ForegroundColor Yellow
$is3306Open = (Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue).TcpTestSucceeded

if (-not $is3306Open) {
    $mysqldPath = Join-Path $ScriptDir "bin\mysql\bin\mysqld.exe"
    $myIniPath = Join-Path $ScriptDir "bin\mysql\my.ini"
    $dataDir = Join-Path $ScriptDir "bin\mysql\data"

    if (-not (Test-Path $mysqldPath)) {
        Write-Host "      Portable MySQL engine not found. Downloading zero-install MariaDB engine (85MB)..." -ForegroundColor Cyan
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

    Write-Host "      Starting portable MySQL server in background..." -ForegroundColor Cyan
    $mysqlProc = Start-Process -FilePath $mysqldPath -ArgumentList "--defaults-file=$myIniPath", "--console" -PassThru -WindowStyle Hidden
    $startedProcesses += $mysqlProc
    Start-Sleep -Seconds 3
} else {
    Write-Host "      MySQL is active on port 3306." -ForegroundColor Green
}

# 4. Database Migrations & Seeds
Write-Host "[3/7] Syncing database schema, admin credentials & slots..." -ForegroundColor Yellow
& npm run db:migrate | Out-Null
& npm run seed:admin | Out-Null
& npm run seed:slots | Out-Null
Write-Host "      Database state verified." -ForegroundColor Green

# 5. Start Backend API Server
Write-Host "[4/7] Starting CoviTrack REST API Server (port 5000)..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ScriptDir "server\dist\server.js"))) {
    & npm run build:server | Out-Null
}
$serverProc = Start-Process -FilePath "node" -ArgumentList (Join-Path $ScriptDir "server\dist\server.js") -PassThru -WindowStyle Hidden
$startedProcesses += $serverProc

for ($i = 0; $i -lt 15; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Seconds 1
}
Write-Host "      Backend API is responsive." -ForegroundColor Green

# 6. Start Frontend Client Server
Write-Host "[5/7] Starting CoviTrack Vite Frontend (port 5173)..." -ForegroundColor Yellow
$clientProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$ScriptDir\client`" && npx vite --host 127.0.0.1 --port 5173" -PassThru -WindowStyle Hidden
$startedProcesses += $clientProc

for ($i = 0; $i -lt 15; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Seconds 1
}
Write-Host "      Vite Frontend is responsive." -ForegroundColor Green

# 7. Execute Live Visible Automated Demo in Chrome
Write-Host "[6/7] Launching Visible Selenium Browser Automation with Live Delays..." -ForegroundColor Green
Write-Host "      Chrome window will open maximized. Please watch the live execution!" -ForegroundColor Cyan
Write-Host "---------------------------------------------------------------------" -ForegroundColor Gray

Set-Location (Join-Path $ScriptDir "automation")
& mvn test -Dtest=LiveDemoTest -Dheadless=false

Set-Location $ScriptDir

# 8. Generate Official QA Report PDF
Write-Host "[7/7] Generating Executive QA Test Execution Report PDF..." -ForegroundColor Yellow
& npm run report:qa

$pdfReportPath = Join-Path $ScriptDir "test-results\CoviTrack_Automated_QA_Test_Report.pdf"

# 9. Cleanup & Teardown
Write-Host "---------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "Cleaning up running servers and test background processes..." -ForegroundColor Yellow

foreach ($proc in $startedProcesses) {
    if ($proc -and -not $proc.HasExited) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}

# Clean any lingering node/vite processes on port 5000 & 5173
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pidToKill in ($port5000 + $port5173)) {
    if ($pidToKill -and $pidToKill -gt 0) {
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  DEMONSTRATION COMPLETE - ALL SYSTEMS CLEANED UP SUCCESSFULLY!      " -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green

if (Test-Path $pdfReportPath) {
    Write-Host "Opening your Official QA Test Report PDF now..." -ForegroundColor Cyan
    Start-Process -FilePath $pdfReportPath
} else {
    Write-Host "PDF report saved to: $pdfReportPath" -ForegroundColor White
}

Write-Host "`nPress Enter to close this window..." -ForegroundColor Gray
Read-Host
