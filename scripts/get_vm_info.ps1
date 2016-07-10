$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

#### login guard ####
$login_success = login_azure
if ($login_success -eq $False) {
    return $False
}
#### login guard ####

function get_vm_info()
{
    $vm_info = (Get-AzureRmVM) | ConvertTo-Json
    return $vm_info
}

get_vm_info