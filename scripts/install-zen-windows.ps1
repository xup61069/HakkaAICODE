param(
    [string]$InstallRoot = "$HOME\HakkaAICODE",
    [switch]$SkipCCSwitch,
    [switch]$UseMultiKey
)

$ErrorActionPreference = "Stop"

$InjectorRepo = "https://github.com/xup61069/zen-header-injector.git"
$InjectorDir = Join-Path $InstallRoot "zen-header-injector"
$InjectorPort = 15722
$MultikeyServer = Join-Path $PSScriptRoot "server-multikey.js"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ("==> " + $Message) -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "檢查前置環境"
if (-not (Test-CommandExists "git")) {
    throw "需要 Git。可執行: winget install Git.Git --silent"
}
if (-not (Test-CommandExists "node")) {
    throw "需要 Node.js (16+)。可執行: winget install OpenJS.NodeJS.LTS --silent"
}

Write-Step "下載 zen-header-injector"
if (-not (Test-Path $InjectorDir)) {
    New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
    git clone $InjectorRepo $InjectorDir
}

$TargetScript = "server.js"
if ($UseMultiKey) {
    if (Test-Path $MultikeyServer) {
        Copy-Item -LiteralPath $MultikeyServer -Destination (Join-Path $InjectorDir "server-multikey.js") -Force
        $TargetScript = "server-multikey.js"
        Write-Host "已部署多 KEY 輪換版本: server-multikey.js" -ForegroundColor Green
    } else {
        Write-Warning "未在腳本旁找到 server-multikey.js，退回標準 server.js"
    }
}

$ServerFile = Join-Path $InjectorDir $TargetScript
if (-not (Test-Path $ServerFile)) {
    throw ("zen-header-injector 不完整：找不到 " + $ServerFile)
}

$listener = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Write-Step ("代理已在 127.0.0.1:" + $InjectorPort + " 監聽")
} else {
    Write-Step ("啟動代理於 127.0.0.1:" + $InjectorPort + " (" + $TargetScript + ")")
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList $TargetScript -WorkingDirectory $InjectorDir
    Start-Sleep -Seconds 2
}

if (-not $SkipCCSwitch) {
    Write-Step "下載 CC Switch 綠色免安裝版 (Portable)"
    try {
        $headers = @{ "User-Agent" = "HakkaAICODE-Installer" }
        $release = Invoke-RestMethod "https://api.github.com/repos/farion1231/cc-switch/releases/latest" -Headers $headers
        $zip = $release.assets | Where-Object { $_.name -match "Windows-Portable\.zip$" -and $_.name -notmatch "arm64" } | Select-Object -First 1
        if (-not $zip) {
            Write-Warning "未找到 CC Switch Windows portable 壓縮檔，請至 https://github.com/farion1231/cc-switch/releases 手動下載。"
        } else {
            $zipPath = Join-Path $env:TEMP $zip.name
            Write-Host ("正在下載 CC Switch (" + $zip.name + ")...")
            Invoke-WebRequest $zip.browser_download_url -OutFile $zipPath
            $target = Join-Path $InstallRoot "cc-switch"
            if (-not (Test-Path $target)) {
                Expand-Archive -Path $zipPath -DestinationPath $target -Force
            }
            $exe = Get-ChildItem -Path $target -Filter "*CC-Switch*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($exe) {
                Write-Step ("CC Switch 已就緒: " + $exe.FullName)
            } else {
                Write-Warning "已解壓 CC Switch，但未自動搜尋到主執行檔。"
            }
        }
    } catch {
        Write-Warning ("自動下載 CC Switch 失敗 (" + $_.Exception.Message + ")，請手動前往 https://github.com/farion1231/cc-switch/releases 下載。")
    }
}

Write-Step "安裝完成"
Write-Host ("代理端點: http://127.0.0.1:" + $InjectorPort + "/v1")
if ($exe) {
    Write-Host ("CC Switch: " + $exe.FullName)
}
Write-Host "模型查詢: node .\scripts\check-models.js"
