param(
    [string]$InstallRoot = "$HOME\HakkaAICODE",
    [string]$KeysFile = "$HOME\HakkaAICODE\zen-keys.txt",
    [int]$InjectorPort = 15722,
    [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"

$InjectorRepo = "https://github.com/xup61069/zen-header-injector.git"
$InjectorDir = Join-Path $InstallRoot "zen-header-injector"
$MultikeyServer = Join-Path $PSScriptRoot "server-multikey.js"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ("==> " + $Message) -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "Check prerequisites"
if (-not (Test-CommandExists "node")) {
    throw "Node.js (16+) is required. Run: winget install OpenJS.NodeJS.LTS --silent"
}
if (-not (Test-Path $MultikeyServer)) {
    throw ("server-multikey.js not found next to this script: " + $MultikeyServer)
}

Write-Step "Ensure zen-header-injector directory"
if (-not (Test-Path $InjectorDir)) {
    if (-not (Test-CommandExists "git")) {
        throw "Git is required. Run: winget install Git.Git --silent"
    }
    New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
    Write-Host "Cloning zen-header-injector repository..."
    git clone $InjectorRepo $InjectorDir
}

Write-Step "Deploy server-multikey.js"
Copy-Item -LiteralPath $MultikeyServer -Destination (Join-Path $InjectorDir "server-multikey.js") -Force
Write-Host ("Deployed: " + (Join-Path $InjectorDir "server-multikey.js"))

Write-Step "Ensure keys file"
if (-not (Test-Path $KeysFile)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $KeysFile) | Out-Null
    $template = @(
        "# HakkaAICODE - OpenCode Zen API Keys List",
        "# Put one OpenCode Zen API key per line. Lines starting with '#' are ignored.",
        "# DO NOT commit or share this file.",
        "# Running injector will hot-reload changes automatically upon saving.",
        "",
        "# Example:",
        "# sk-zen-example-key-1",
        "# sk-zen-example-key-2"
    )
    $template -join "`r`n" | Set-Content -LiteralPath $KeysFile -Encoding UTF8
    Write-Host ("Created keys template: " + $KeysFile) -ForegroundColor Yellow
    Write-Warning ("Please paste your OpenCode Zen keys into: " + $KeysFile)
} else {
    Write-Host ("Keys file exists: " + $KeysFile) -ForegroundColor Green
}

if (-not $SkipRestart) {
    $endpointStr = "127.0.0.1:" + $InjectorPort
    Write-Step ("Restart proxy on " + $endpointStr)
    $listener = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        foreach ($conn in $listener) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -match "node") {
                Write-Host ("Stopping previous Node injector process on port " + $InjectorPort + " (PID " + $conn.OwningProcess + ")")
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            } else {
                Write-Warning ("Port " + $InjectorPort + " is occupied by non-Node process: " + $proc.ProcessName + " (PID " + $conn.OwningProcess + "). Skipping automatic kill.")
            }
        }
        Start-Sleep -Seconds 1
    }

    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server-multikey.js" -WorkingDirectory $InjectorDir
    Start-Sleep -Seconds 2

    $after = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if (-not $after) {
        throw ("Failed to bind on 127.0.0.1:" + $InjectorPort + ". Check " + $InjectorDir + "\server-multikey.js and injector.log")
    }

    try {
        $healthUrl = "http://127.0.0.1:" + $InjectorPort + "/__health"
        $health = Invoke-RestMethod $healthUrl -TimeoutSec 3
        Write-Host ("Proxy is online! (Configured keys: " + $health.keys.total + " | Ready: " + $health.keys.ready + ")") -ForegroundColor Green
    } catch {
        Write-Host "Proxy started and listening."
    }
}

Write-Step "Completed"
Write-Host ("Keys file   : " + $KeysFile)
Write-Host ("Endpoint    : http://127.0.0.1:" + $InjectorPort + "/v1")
Write-Host ("Health check: http://127.0.0.1:" + $InjectorPort + "/__health")
Write-Host "Check models: node .\scripts\check-models.js"