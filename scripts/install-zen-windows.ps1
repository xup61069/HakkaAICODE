param(
    [string]$InstallRoot = "$HOME\HakkaAICODE",
    [switch]$SkipCCSwitch
)

$ErrorActionPreference = "Stop"

$InjectorRepo = "https://github.com/xup61069/zen-header-injector.git"
$InjectorDir = Join-Path $InstallRoot "zen-header-injector"
$InjectorPort = 15722

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-CommandExists([string]$CommandName) {
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

Write-Step "Check prerequisites"
if (-not (Test-CommandExists "git")) {
    throw "Git is required. Run: winget install Git.Git --silent"
}
if (-not (Test-CommandExists "node")) {
    throw "Node.js is required. Run: winget install OpenJS.NodeJS.LTS --silent"
}

Write-Step "Download zen-header-injector"
if (-not (Test-Path $InjectorDir)) {
    New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
    git clone $InjectorRepo $InjectorDir
}

$ServerFile = Join-Path $InjectorDir "server.js"
if (-not (Test-Path $ServerFile)) {
    throw "zen-header-injector is incomplete: $ServerFile not found"
}

$listener = Get-NetTCPConnection -LocalPort $InjectorPort -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Write-Step "Injector already listening on 127.0.0.1:$InjectorPort"
} else {
    Write-Step "Start injector on 127.0.0.1:$InjectorPort"
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $InjectorDir
    Start-Sleep -Seconds 2
}

if (-not $SkipCCSwitch) {
    Write-Step "Download CC Switch portable"
    $release = Invoke-RestMethod "https://api.github.com/repos/farion1231/cc-switch/releases/latest"
    $zip = $release.assets | Where-Object { $_.name -match "Windows-Portable\.zip$" -and $_.name -notmatch "arm64" } | Select-Object -First 1
    if (-not $zip) {
        Write-Warning "Could not find CC Switch Windows portable asset; install manually from the latest release."
    } else {
        $zipPath = Join-Path $env:TEMP $zip.name
        Invoke-WebRequest $zip.browser_download_url -OutFile $zipPath
        $target = Join-Path $InstallRoot "cc-switch"
        if (-not (Test-Path $target)) {
            Expand-Archive -Path $zipPath -DestinationPath $target -Force
        }
        $exe = Get-ChildItem -Path $target -Filter "*CC-Switch*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($exe) {
            Write-Step "CC Switch is available at $($exe.FullName)"
        } else {
            Write-Warning "Unzipped CC Switch, but could not find an executable automatically."
        }
    }
}

Write-Step "Done"
Write-Host "Injector endpoint: http://127.0.0.1:$InjectorPort/v1"
if ($exe) {
    Write-Host "CC Switch portable: $($exe.FullName)"
}
