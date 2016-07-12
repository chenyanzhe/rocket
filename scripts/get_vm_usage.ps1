param (
    [string]$locations = "eastus&eastus2&westus&eastasia&southeastasia&japaneast"
)

$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function get_vm_usage_helper([String] $location)
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

function get_vm_usage([String] $locations)
{
    $usageArr = @()
    $locArr = $locations -Split "&"
    foreach ($loc in $locArr) {
        $usage = get_vm_usage_helper $loc
        if ($usage.Get_Item("code") -eq $False) {
            $ret = @{"code" = $False; "output" = $usage.Get_Item("output")}
            return $ret
        }
        $usageArr += @{"name" = $loc; "usage" = $usage.Get_Item("output")}
    }

    $ret = @{"code" = $True; "output" = $usageArr}
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}



return (get_vm_usage $locations) | ConvertTo-Json -Depth 5