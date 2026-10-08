$ErrorActionPreference = 'Stop'

$hostName = 'lonepay.local'
$hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
$isAdministrator = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdministrator) {
    Write-Host 'Administrator permission is required only to add this local hosts-file entry.'
    try {
        $arguments = @(
            '-NoProfile'
            '-ExecutionPolicy'
            'Bypass'
            '-File'
            "`"$PSCommandPath`""
        )
        $elevated = Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -Verb RunAs -Wait -PassThru
        exit $elevated.ExitCode
    }
    catch {
        Write-Error "Could not obtain administrator permission or update the hosts file: $($_.Exception.Message)"
        exit 1
    }
}

if (-not (Test-Path -LiteralPath $hostsPath)) {
    throw "Windows hosts file was not found: $hostsPath"
}

$entries = foreach ($line in [IO.File]::ReadAllLines($hostsPath)) {
    $content = ($line -split '#', 2)[0].Trim()
    if (-not $content) {
        continue
    }

    $parts = $content -split '\s+'
    if ($parts.Count -gt 1 -and $parts[1..($parts.Count - 1)] -contains $hostName) {
        [pscustomobject]@{
            Address = $parts[0]
            Line = $line
        }
    }
}

if ($entries) {
    if (@($entries).Count -eq 1 -and $entries[0].Address -eq '127.0.0.1') {
        Write-Host "$hostName is already mapped to 127.0.0.1; no changes were needed."
    }
    else {
        $details = ($entries | ForEach-Object { $_.Line.Trim() }) -join '; '
        throw "A conflicting hosts-file mapping already exists for $hostName ($details). No changes were made."
    }
}
else {
    $backupPath = "$hostsPath.lonepay-$(Get-Date -Format 'yyyyMMdd-HHmmss').bak"
    Copy-Item -LiteralPath $hostsPath -Destination $backupPath
    [IO.File]::AppendAllText(
        $hostsPath,
        "`r`n127.0.0.1`t$hostName`r`n",
        [Text.Encoding]::ASCII
    )
    Write-Host "Added $hostName to the hosts file."
    Write-Host "Backup: $backupPath"
}

& ipconfig.exe /flushdns | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'The hosts entry was written, but Windows could not flush its DNS cache.'
}

$addresses = [Net.Dns]::GetHostAddresses($hostName) | ForEach-Object { $_.IPAddressToString }
if ($addresses -notcontains '127.0.0.1') {
    throw "$hostName did not resolve to 127.0.0.1 after the hosts-file update (resolved: $($addresses -join ', '))."
}

Write-Host "$hostName now resolves to 127.0.0.1."
