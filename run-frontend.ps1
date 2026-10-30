$ErrorActionPreference = 'Stop'

$frontendPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'frontend'
Set-Location $frontendPath

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm was not found. Install Node.js 20 or newer and reopen the terminal.'
}

if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    npm ci
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

npm.cmd run dev -- --host=127.0.0.1 --port=5174
