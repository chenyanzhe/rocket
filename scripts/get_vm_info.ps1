$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function get_vm_info()
{
    $vm_info = Get-AzureRmVM -ErrorVariable err

    if ($? -eq $False) {
        log_msg "get_vm_info: Get-AzureRmVM failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $ret = @{"code" = $True; "output" = $vm_info}
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

return get_vm_info | ConvertTo-Json