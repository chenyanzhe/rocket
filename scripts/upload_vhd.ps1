param (
    [string]$localFilePath = "fakePath"
)

$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$global:location = "westus"
$global:blobContainerName = "rocket-vhds/"

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function create_resource_group_if_not_exist() {
    $global:resourceGroupName = $global:namePrefix + "rg"
    $rgObj = Get-AzureRmResourceGroup -Name $global:resourceGroupName
    $ret = @{"code" = $True;}
    ## TODO: should check resource group location is consistent with $global:location
    if ($? -eq $False) {
        log_msg "Creating resource group $global:resourceGroupName for $global:accountAlias"
        $rgObj = New-AzureRmResourceGroup -Name $global:resourceGroupName `
                                                -Location $global:location `
                                                -ErrorVariable err
        if ($? -eq $False) {
            log_msg "New-AzureRmResourceGroup fail"
            $ret = @{"code" = $False; "output" = $err}
            return $ret
        }
    } else {
        log_msg "Resource group $global:resourceGroupName is already exist"
    }
    return $ret
}

function create_storage_accout_if_not_exist() {
    $global:storageAccoutName = $global:namePrefix + "storage"
    $storageAcc = Get-AzureRmStorageAccount -ResourceGroupName $global:resourceGroupName `
                                            -AccountName $global:storageAccoutName
    $ret = @{"code" = $True;}
    if ($? -eq $False) {
        log_msg "creating storage account $global:storageAccoutName for $global:resourceGroupName"
        $storageAcc = New-AzureRmStorageAccount -ResourceGroupName $global:resourceGroupName `
                                         -Name $global:storageAccoutName `
                                         -Location $global:location `
                                         -SkuName "Standard_GRS" `
                                         -Kind "Storage" `
                                         -ErrorVariable err
        if ($? -eq $False) {
            log_msg "New-AzureRmStorageAccount fail"
            $ret = @{"code" = $False; "output" = $err}
            return $ret
        }
    } else {
        log_msg "storage account $global:storageAccoutName is already exist"
    }
    $global:storageAccoutUrl = $storageAcc.PrimaryEndpoints.Blob
    log_msg "storageAccoutUrl = $global:storageAccoutUrl"
    return $ret
}

function upload_vm_img_to_storage_account([String] $localFilePath) {
    $ts = Get-Date -Format yyyy-MM-dd-HH-mm-ss
    $fileExists = Test-Path $localFilePath -PathType Leaf
    $ret = @{"code" = $True;}
    if ($fileExists) {
        $vhdName = [IO.Path]::GetFileNameWithoutExtension($localFilePath)
        $blobFileName = $vhdName + "-" + $ts + ".vhd"
        $destinationUri = $global:storageAccoutUrl + $global:blobContainerName + $blobFileName
        log_msg "uploading $localFilePath to $destinationUri"
        Add-AzureRmVhd -ResourceGroupName $global:resourceGroupName `
                       -Destination $destinationUri `
                       -LocalFilePath "$localFilePath" `
                       -ErrorVariable err
        if ($? -eq $False) {
            log_msg "Add-AzureRmVhd failed"
            $ret = @{"code" = $False; "output" = $err}
            return $ret
        } else {
            log_msg "upload complete"
            $global:uploadedVhdUri = $destinationUri
        }
    } else {
        $err = "$localFilePath does not exit"
        log_msg $err
        $ret = @{"code" = $False; "output" = $err}
    }
    return $ret
}

$ret = login_azure
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

$ret = create_resource_group_if_not_exist
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

$ret = create_storage_accout_if_not_exist
if ($ret.Get_Item("code") -eq $False) {
    return $ret | ConvertTo-Json
}

return (upload_vm_img_to_storage_account $localFilePath) | ConvertTo-Json