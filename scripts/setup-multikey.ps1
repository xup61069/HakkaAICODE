param(
    [string]$KeysFile = "$HOME\HakkaAICODE\zen-keys.txt",
    [int]$InjectorPort = 15722,
    [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

$ServerFile = Join-Path $PSScriptRoot "server-multikey.js"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ("==> " + $Message) -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "檢查前置環境"
if (-not (Test-CommandExists "node")) {
    throw "Node.js (16+) is required. Run: winget install OpenJS.NodeJS.LTS --silent"
}
if (-not (Test-Path -LiteralPath $ServerFile)) {
    throw ("Proxy server not found next to this script: " + $ServerFile)
}

Write-Step "確認金鑰檔案"
$keysDir = Split-Path -Parent $KeysFile
if (-not (Test-Path -LiteralPath $keysDir)) {
    New-Item -ItemType Directory -Force -Path $keysDir | Out-Null
}
if (-not (Test-Path -LiteralPath $KeysFile)) {
    $template = @(
        "# HakkaAICODE - API Keys List",
        "# Put one API key per line. Lines starting with '#' are ignored.",
        "# DO NOT commit or share this file.",
        "# Saving this file hot-reloads the running proxy.",
        "",
        "# Example:",
        "# sk-example-key-1",
        "# sk-example-key-2"
    )
    [System.IO.File]::WriteAllLines($KeysFile, $template, [System.Text.UTF8Encoding]::new($false))
    Write-Host ("Created keys template: " + $KeysFile) -ForegroundColor Yellow
    Write-Warning ("Please paste your API keys into: " + $KeysFile)
} else {
    Write-Host ("Keys file exists: " + $KeysFile) -ForegroundColor Green
}

if (-not $SkipRestart) {
    $port = "127.0.0.1:" + $InjectorPort
    Write-Step ("Restart proxy on " + $port)

    $listener = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        $seenProcessIds = @{}
        foreach ($conn in $listener) {
            if ($seenProcessIds.ContainsKey($conn.OwningProcess)) { continue }
            $seenProcessIds[$conn.OwningProcess] = $true
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -match "node") {
                Write-Host ("Stopping previous Node process on port " + $InjectorPort + " (PID " + $conn.OwningProcess + ")")
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            } elseif ($proc) {
                Write-Warning ("Port " + $InjectorPort + " is occupied by non-Node process: " + $proc.ProcessName + " (PID " + $conn.OwningProcess + "). Skipping automatic kill.")
            }
        }
        Start-Sleep -Seconds 1
    }

    $env:ZEN_INJECTOR_PORT = [string]$InjectorPort
    $env:ZEN_INJECTOR_KEYS_FILE = $KeysFile
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "`"$ServerFile`"" -WorkingDirectory $PSScriptRoot
    Start-Sleep -Seconds 2

    $after = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if (-not $after) {
        throw ("Failed to bind on 127.0.0.1:" + $InjectorPort + ". Check " + $ServerFile + " and injector.log")
    }

    try {
        $health = Invoke-RestMethod ("http://127.0.0.1:" + $InjectorPort + "/__health") -TimeoutSec 3
        Write-Host ("Proxy is online! (Configured keys: " + $health.keys.total + " | Ready: " + $health.keys.ready + ")") -ForegroundColor Green
    } catch {
        Write-Host "Proxy started and listening."
    }
}

Write-Step "完成"
Write-Host ("Keys file   : " + $KeysFile)
Write-Host ("Endpoint    : http://127.0.0.1:" + $InjectorPort + "/v1")
Write-Host ("Health check: http://127.0.0.1:" + $InjectorPort + "/__health")
Write-Host "Check models: node .\scripts\check-models.js"
