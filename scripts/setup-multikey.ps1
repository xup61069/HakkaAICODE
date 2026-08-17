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
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "Check prerequisites"
if (-not (Test-CommandExists "node")) {
    throw "Node.js is required. Run: winget install OpenJS.NodeJS.LTS --silent"
}
if (-not (Test-Path $MultikeyServer)) {
    throw "server-multikey.js not found next to this script: $MultikeyServer"
}

Write-Step "Ensure zen-header-injector is present"
if (-not (Test-Path $InjectorDir)) {
    New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
    git clone $InjectorRepo $InjectorDir
}

Write-Step "Deploy multikey server into injector dir"
Copy-Item -LiteralPath $MultikeyServer -Destination (Join-Path $InjectorDir "server-multikey.js") -Force
Write-Host "Deployed: $(Join-Path $InjectorDir 'server-multikey.js')"

Write-Step "Ensure keys file exists"
if (-not (Test-Path $KeysFile)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $KeysFile) | Out-Null
    @(
        "# 每行一把 OpenCode Zen API key，'#' 開頭的行會被忽略。"
        "# 不要把這個檔案 commit 進 git 或分享出去。"
        ""
        "# 範例："
        "# sk-zen-aaaa"
        "# sk-zen-bbbb"
    ) | Set-Content -LiteralPath $KeysFile -Encoding UTF8
    Write-Host "Created empty template: $KeysFile"
    Write-Warning "請把 key 貼進 $KeysFile（一行一把），再重跑一次本腳本或重啟 injector。"
}

if (-not $SkipRestart) {
    Write-Step "Restart injector on 127.0.0.1:$InjectorPort"
    $listener = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        foreach ($conn in $listener) {
            Write-Host "Stopping PID $($conn.OwningProcess) on port $InjectorPort"
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
    }
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server-multikey.js" -WorkingDirectory $InjectorDir
    Start-Sleep -Seconds 2
    $after = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
    if (-not $after) {
        throw "Injector did not come up on 127.0.0.1:$InjectorPort. Check $InjectorDir\server-multikey.js and injector.log"
    }
}

Write-Step "Done"
Write-Host "Keys file   : $KeysFile"
Write-Host "Endpoint    : http://127.0.0.1:$InjectorPort/v1"
Write-Host "Injected    : server-multikey.js in $InjectorDir"