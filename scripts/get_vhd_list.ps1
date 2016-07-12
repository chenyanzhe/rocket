$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

$resourceGroupName = $global:namePrefix + "rg"
$storageAccountName = $global:namePrefix + "storage"
$containerName = "rocket-vhds"

function get_storage_account_key()
{
    $storageAccountKey = Get-AzureRmStorageAccountKey `
                            -ResourceGroupName $resourceGroupName `
                            -Name $storageAccountName `
                            -ErrorVariable err
    if ($? -eq $False) {
        log_msg "get_storage_account_key: Get-AzureRmStorageAccountKey failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $ret = @{"code" = $True; "output" = $storageAccountKey[0].Value}
    return $ret
}

function get_vhd_list()
{
    $storageAccountKeyRet = get_storage_account_key
    if ($ret.Get_Item("code") -eq $False) {
        return $ret
    }
    $storageAccountKey = $storageAccountKeyRet.Get_Item("output")
    $ctx = New-AzureStorageContext $storageAccountName `
                            -StorageAccountKey $storageAccountKey `
                            -ErrorVariable err
    if ($? -eq $False) {
        log_msg "get_vhd_list: New-AzureStorageContext failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $vhd_list = Get-AzureStorageBlob -Container $containerName `
                                     -Context $ctx `
                                     -ErrorVariable err
    if ($? -eq $False) {
        log_msg "get_vhd_list: Get-AzureStorageBlob failed"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
        return $ret
    }

    $ret = @{"code" = $True; "output" = $vhd_list}
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

return get_vhd_list | ConvertTo-Json