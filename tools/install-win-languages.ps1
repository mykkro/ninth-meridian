#Requires -Version 5.1
<#
.SYNOPSIS
Installs Windows language Basic and TextToSpeech features for browser speech.
.EXAMPLE
.\tools\install-win-languages.ps1 -WhatIf
.EXAMPLE
.\tools\install-win-languages.ps1 -Languages en-GB,cs-CZ
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [string[]]$Languages,
    [switch]$IncludeDisplayLanguagePack
)

$ErrorActionPreference = 'Stop'
if (-not $PSBoundParameters.ContainsKey('Languages')) {
    # Keep defaults synchronized with the game, not an independent language list.
    $worldPath = Join-Path $PSScriptRoot '..\data\world.json'
    $world = Get-Content -LiteralPath $worldPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $windowsTags = @{
        cs='cs-CZ'; sk='sk-SK'; pl='pl-PL'; uk='uk-UA'; ru='ru-RU'; en='en-GB'
        es='es-ES'; it='it-IT'; de='de-DE'; nl='nl-NL'; da='da-DK'; fr='fr-FR'
        el='el-GR'; no='nb-NO'; sv='sv-SE'; fi='fi-FI'; hu='hu-HU'
    }
    $Languages = @(foreach ($language in $world.languages.PSObject.Properties.Name) {
        if ($language -in @('ga','la','eo')) { continue }
        if (-not $windowsTags.ContainsKey($language)) { throw "No Windows language tag configured for game language: $language" }
        $windowsTags[$language]
    })
    Write-Host "Game speech languages: $($Languages -join ', ')" -ForegroundColor Cyan
}
if ($env:OS -ne 'Windows_NT') { throw 'This script requires Windows.' }
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -and -not $WhatIfPreference) {
    throw 'Open Windows PowerShell as Administrator, then run this script again.'
}
if (-not (Get-Command Add-WindowsCapability -ErrorAction SilentlyContinue)) {
    throw 'Windows DISM cmdlets are unavailable. Use 64-bit Windows PowerShell 5.1.'
}
$results = @()
$restartNeeded = $false
foreach ($tag in ($Languages | Select-Object -Unique)) {
    if ($tag -notmatch '^[a-z]{2,3}-[A-Z]{2}$') { throw "Invalid language tag: $tag (use tags such as cs-CZ)." }
    if ($tag -match '^(ga|la|eo)-') { Write-Warning "Skipping ${tag}: excluded from game speech."; continue }
    if ($IncludeDisplayLanguagePack -and $PSCmdlet.ShouldProcess($tag, 'Install display language pack without changing system defaults')) {
        try {
            if (-not (Get-Command Install-Language -ErrorAction SilentlyContinue)) { throw 'Install-Language is unavailable on this Windows edition.' }
            Install-Language -Language $tag -ErrorAction Stop | Out-Null
        } catch { Write-Warning "Display pack ${tag}: $($_.Exception.Message)" }
    }
    $basicFailed = $false
    foreach ($feature in @('Basic','TextToSpeech')) {
        $name = "Language.$feature~~~$tag~0.0.1.0"
        if ($feature -eq 'TextToSpeech' -and $basicFailed) {
            $results += [pscustomobject]@{Language=$tag;Feature=$feature;Status='Skipped: Basic failed'}
            continue
        }
        # WhatIf previews names without invoking privileged DISM queries.
        if (-not $PSCmdlet.ShouldProcess($name, 'Ensure Windows capability is installed')) { continue }
        try {
            $capability = Get-WindowsCapability -Online -Name $name -ErrorAction Stop
            if (-not $capability -or $capability.Name -ne $name) {
                $status = 'Unavailable on this Windows installation'
                if ($feature -eq 'Basic') { $basicFailed = $true }
            } elseif ($capability.State -eq 'Installed') {
                $status = 'Already installed'
            } else {
                $installed = Add-WindowsCapability -Online -Name $name -ErrorAction Stop
                $restartNeeded = $restartNeeded -or $installed.RestartNeeded
                $status = 'Installed'
            }
        } catch {
            $status = "Failed: $($_.Exception.Message)"
            if ($feature -eq 'Basic') { $basicFailed = $true }
            Write-Warning "${name}: $status"
        }
        $results += [pscustomobject]@{Language=$tag;Feature=$feature;Status=$status}
    }
}
$results | Format-Table -AutoSize -Wrap
if ($restartNeeded) { Write-Host 'Windows reports that a restart is required.' -ForegroundColor Yellow }
Write-Host 'Finished. Review failures above. Restart the browser after installation; browser voice availability can differ from Windows Narrator.' -ForegroundColor Cyan
