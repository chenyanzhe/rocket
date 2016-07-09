$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$timeStamp = Get-Date -format yyyy-MM-dd-HH-mm-ss

$logFile = $currentWorkingDir + "\log-" + $timeStamp + ".txt"

function log_msg([String] $msg) {
    $ts = Get-Date -Format yyyy-MM-dd-HH-mm-ss
    $outputMsg = $ts + ": " + "[" + $global:namespace + "] " + $msg
    echo $outputMsg >> $logFile
}

function login_azure()
{
    $thumbprint = "E3F17462987513A49EC814F5963F9B81A0052950"
    $applicationId = "7bbcf204-41d2-42cf-aba3-5bf7f097445a"
    $tenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47"

    Add-AzureRmAccount -ServicePrincipal -CertificateThumbprint "$thumbprint" -ApplicationId "$applicationId" -TenantId "$tenantId"
    if ($? -eq $False) {
        log_msg "Fail to login via azure service principal"
        return $False
    }
}