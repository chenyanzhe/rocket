param (
    [string]$location = "eastus"
)

$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function get_vm_usage([String] $location)
{
    $vm_usage = Get-AzureRmVMUsage -Location $location -ErrorVariable err

    if ($? -eq $False) {
        log_msg "get_vm_usage: Get-AzureRmVMUsage failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $ret = @{"code" = $True; "output" = $vm_usage}
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

return (get_vm_usage $location) | ConvertTo-Json -Depth 3