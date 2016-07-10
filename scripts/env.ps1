$global:password = "tyachen123"
$global:applicationId = "8a82026c-0ed3-4023-953e-50a95005c3e0"
$global:tenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47"

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
    $securePassword = ConvertTo-SecureString $global:password -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential ($global:applicationId, $securePassword);
    Add-AzureRmAccount -Credential $cred -ServicePrincipal -TenantId $global:tenantId
    if ($? -eq $False) {
        log_msg "login via sp failed"
        return $False
    }
}