$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function get_ava_locs()
{
    $locs_list = Get-AzureLocation -ErrorVariable err
    if ($? -eq $False) {
        log_msg "get_ava_locs: Get-AzureLocation failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $ret = @{"code" = $True; "output" = $locs_list}
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

return get_ava_locs | ConvertTo-Json