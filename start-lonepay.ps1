param(
    # Headless mode is used by the automatic-startup scheduled task: the server
    # runs without a console window, its output is written to tools\logs, this
    # script blocks while the server runs (so Task Scheduler can restart it),
    # and no browser is opened. The default (no switch) behaviour is unchanged.
    [switch]$Headless
)

$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$url = 'http://lonepay.local/'
$port = 3000
$buildIdPath = Join-Path $projectRoot '.next\BUILD_ID'
$serverProcess = $null

# A freshly rebuilt .next directory can appear newer than the running server by
# a fraction of a second because of filesystem timestamp granularity, so allow
# a small tolerance before declaring the running server stale.
$buildFreshnessToleranceSeconds = 2

function Get-Listener {
    param([int]$LocalPort)
    Get-NetTCPConnection -State Listen -LocalPort $LocalPort -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

function Get-Response {
    param(
        [string]$Uri,
        [hashtable]$Headers = @{}
    )
    Invoke-WebRequest -Uri $Uri -Headers $Headers -UseBasicParsing -TimeoutSec 5
}

function Test-LonePayOwnedProcess {
    param([int]$ProcessId)

    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
    if (-not $process) {
        return $false
    }

    # Only a process whose command line references this project may be stopped.
    $commandLine = [string]$process.CommandLine
    return $commandLine.IndexOf($projectRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Get-ProcessStartTime {
    param([int]$ProcessId)

    try {
        return (Get-Process -Id $ProcessId -ErrorAction Stop).StartTime
    }
    catch {
        try {
            return (Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction Stop).CreationDate
        }
        catch {
            return $null
        }
    }
}

function Test-BuildIsNewerThanServer {
    param([datetime]$ServerStartTime)

    # next start loads its production build (including the route manifest) when
    # it boots. If .next was (re)built after the server started, the server is
    # serving a stale build even though the route files now exist on disk.
    $buildTime = (Get-Item -LiteralPath $buildIdPath).LastWriteTime
    return $buildTime -gt $ServerStartTime.AddSeconds($buildFreshnessToleranceSeconds)
}

function Stop-LonePayServer {
    param([int]$ProcessId)

    # Re-check ownership immediately before stopping so an unrelated process that
    # reused the same PID can never be killed.
    if (-not (Test-LonePayOwnedProcess -ProcessId $ProcessId)) {
        throw "Refusing to stop PID $ProcessId because it is no longer the verified LonePay server."
    }

    Stop-Process -Id $ProcessId -Force -ErrorAction Stop

    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if (-not (Get-Listener -LocalPort $port)) {
            return
        }
        Start-Sleep -Milliseconds 500
    }

    throw "Port $port is still in use after stopping the LonePay server (PID $ProcessId)."
}

try {
    try {
        $addresses = [Net.Dns]::GetHostAddresses('lonepay.local') |
            ForEach-Object { $_.IPAddressToString }
    }
    catch {
        throw 'lonepay.local could not be resolved. Run configure-lonepay-hosts.bat once and approve its administrator prompt.'
    }

    if ($addresses -notcontains '127.0.0.1') {
        throw "lonepay.local does not resolve to 127.0.0.1. Run configure-lonepay-hosts.bat once and approve its administrator prompt."
    }

    $apache = Get-Listener -LocalPort 80
    if (-not $apache) {
        throw 'XAMPP Apache is not listening on port 80. Start Apache in the XAMPP Control Panel, then run this launcher again.'
    }

    $apacheProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($apache.OwningProcess)"
    if (-not $apacheProcess -or $apacheProcess.Name -ne 'httpd.exe') {
        throw "Port 80 is occupied by a process other than XAMPP Apache (PID $($apache.OwningProcess)). No service was started."
    }

    $listener = Get-Listener -LocalPort $port
    $serverReady = $false
    if ($listener) {
        $serverPid = $listener.OwningProcess

        if (-not (Test-LonePayOwnedProcess -ProcessId $serverPid)) {
            throw "Port $port is occupied by another process (PID $serverPid). Close that service or change its port; LonePay was not started."
        }

        if (-not (Test-Path -LiteralPath $buildIdPath)) {
            throw "A LonePay server is running on port $port, but the Next.js production build is missing. Run npm run build from the project root, then retry."
        }

        $serverStartTime = Get-ProcessStartTime -ProcessId $serverPid
        $isStale = $true
        if ($serverStartTime) {
            $isStale = Test-BuildIsNewerThanServer -ServerStartTime $serverStartTime
        }

        if (-not $isStale) {
            Write-Host "Reusing the LonePay server already running on port $port (PID $serverPid); it is serving the current build."
            $serverReady = $true
        }
        else {
            if ($serverStartTime) {
                Write-Host "The LonePay server on port $port (PID $serverPid) started before the current build at $buildIdPath."
            }
            else {
                Write-Host "Could not read the start time of the LonePay server on port $port (PID $serverPid); treating it as stale."
            }

            Write-Host 'Stopping that verified LonePay server and starting a fresh one with the current build...'
            Stop-LonePayServer -ProcessId $serverPid
        }
    }

    if (-not $serverReady) {
        if (-not (Test-Path -LiteralPath $buildIdPath)) {
            throw 'The Next.js production build is missing. Run npm run build from the project root, then retry.'
        }

        if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
            throw 'npm was not found. Install Node.js with npm, then retry.'
        }

        Write-Host "Starting LonePay from $projectRoot. Server output will remain visible in its own terminal."
        $command = "cd /d `"$projectRoot`" && npm start"
        Start-Process -FilePath $env:ComSpec -ArgumentList @('/k', $command) -WorkingDirectory $projectRoot -WindowStyle Normal | Out-Null

        $ready = $false
        for ($attempt = 0; $attempt -lt 60; $attempt++) {
            Start-Sleep -Seconds 1
            try {
                $response = Get-Response -Uri "http://127.0.0.1:$port/"
                if ($response.StatusCode -eq 200 -and $response.Content -match 'LonePay') {
                    $ready = $true
                    break
                }
            }
            catch {
                # The server may still be starting; the visible server terminal reports startup errors.
            }
        }

        if (-not $ready) {
            throw "The LonePay server did not become ready on port $port within 60 seconds. Check its terminal for errors."
        }
    }

    $page = Get-Response -Uri $url
    $title = [regex]::Match($page.Content, '<title>(.*?)</title>').Groups[1].Value
    if ($page.StatusCode -ne 200 -or $title -notmatch 'LonePay') {
        throw "Apache did not return the LonePay page successfully at $url (HTTP $($page.StatusCode)). Check that its LonePay reverse-proxy virtual host is enabled."
    }

    Write-Host "LonePay is responding at $url"
    Start-Process $url
}
catch {
    Write-Host "LonePay could not be launched: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}