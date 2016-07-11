#### predefined variables ####
$global:accountAlias = "tyachen"
$global:applicationId = "8a82026c-0ed3-4023-953e-50a95005c3e0"
$global:tenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47"
#### predefined variables ####


$global:password = $global:accountAlias + "123"
$global:namePrefix = $global:accountAlias + "rocket"

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

function create_credential($arg_user, $arg_pwd) {
    $securePassword = ConvertTo-SecureString $arg_pwd -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential ($arg_user, $securePassword);
    return $cred
}

function login_azure()
{
    $cred = create_credential $global:applicationId $global:password
    $accountObj = Add-AzureRmAccount -Credential $cred -ServicePrincipal -TenantId $global:tenantId -ErrorVariable err
    if ($? -eq $False) {
        log_msg "login_azure: Add-AzureRmAccount failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }
    $global:subscriptionId = $accountObj.Context.Subscription.SubscriptionId
    $global:subscriptionName = $accountObj.Context.Subscription.SubscriptionName
    $ret = @{"code" = $True}
    return $ret
}