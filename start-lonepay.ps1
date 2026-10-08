$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$url = 'http://lonepay.local/'
$port = 3000

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
    if ($listener) {
        $serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        $commandLine = [string]$serverProcess.CommandLine
        if (-not $serverProcess -or $commandLine.IndexOf($projectRoot, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "Port $port is occupied by another process (PID $($listener.OwningProcess)). Close that service or change its port; LonePay was not started."
        }

        Write-Host "Reusing the LonePay server already running on port $port (PID $($listener.OwningProcess))."
    }
    else {
        if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.next\BUILD_ID'))) {
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
