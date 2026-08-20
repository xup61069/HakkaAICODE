param(
    [string]$KeysFile = "$HOME\HakkaAICODE\zen-keys.txt",
    [int]$InjectorPort = 15722,
    [switch]$SkipCCSwitch,
    [switch]$UseMultiKey
)

$ErrorActionPreference = "Stop"

if ($UseMultiKey) {
    Write-Host "UseMultiKey 參數已不需要：本專案代理原本就是多 KEY 版本，會忽略此參數。" -ForegroundColor Yellow
}

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ("==> " + $Message) -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "檢查前置環境"
if (-not (Test-CommandExists "node")) {
    throw "需要 Node.js (16+)。可執行: winget install OpenJS.NodeJS.LTS --silent"
}

$setupScript = Join-Path $PSScriptRoot "setup-multikey.ps1"
if (-not (Test-Path -LiteralPath $setupScript)) {
    throw ("找不到 setup-multikey.ps1：" + $setupScript)
}

Write-Step "設定並啟動本機代理"
& $setupScript -KeysFile $KeysFile -InjectorPort $InjectorPort
if ($LASTEXITCODE -ne 0) {
    throw "setup-multikey.ps1 執行失敗"
}

if (-not $SkipCCSwitch) {
    Write-Step "下載 CC Switch 免安裝版 (Portable)"
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
            $target = Join-Path $env:USERPROFILE "HakkaAICODE\cc-switch"
            if (-not (Test-Path -LiteralPath $target)) {
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
Write-Host "模型查詢: node .\scripts\check-models.js"
