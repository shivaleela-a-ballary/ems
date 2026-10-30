$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $repositoryRoot 'backend'

if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    $javaCandidates = @(
        'C:\Program Files\Eclipse Adoptium\jdk-21*',
        (Join-Path $env:USERPROFILE 'jdk21\jdk-*')
    )

    $javaHome = $javaCandidates |
        ForEach-Object { Get-ChildItem -Path $_ -Directory -ErrorAction SilentlyContinue } |
        Sort-Object FullName -Descending |
        Select-Object -First 1

    if ($javaHome) {
        $env:JAVA_HOME = $javaHome.FullName
    } else {
        throw 'Java 21 was not found. Install JDK 21 or set JAVA_HOME to its installation folder.'
    }
}

$env:Path = "$env:JAVA_HOME\bin;$env:Path"

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    throw "Java is not available from JAVA_HOME ($env:JAVA_HOME)."
}

$mysqlService = Get-Service -Name 'MySQL80' -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -ne 'Running') {
    Start-Service -Name 'MySQL80'
    $mysqlService.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
}

if (-not $mysqlService) {
    throw 'MySQL80 service was not found. Install MySQL Server 8 or start your MySQL service manually.'
}

if (-not $env:SPRING_DATASOURCE_PASSWORD) {
    $securePassword = Read-Host 'Enter the MySQL password for the root user' -AsSecureString
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $env:SPRING_DATASOURCE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
}

Set-Location $backendPath
& .\mvnw.cmd spring-boot:run
