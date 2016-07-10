$currentWorkingDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. $currentWorkingDir\env.ps1

$global:location = "westus"
$global:blobContainerName = "rocket-vhds/"

$currentScriptName = $MyInvocation.MyCommand.Name
$global:namespace = [IO.Path]::GetFileNameWithoutExtension($currentScriptName)

function create_resource_group_if_not_exist() {
    $global:resourceGroupName = $global:namePrefix + "rg"
    $rgObj = Get-AzureRmResourceGroup -Name $global:resourceGroupName
    ## TODO: should check resource group location is consistent with $global:location
    if ($? -eq $False) {
        echo "creating resource group $global:resourceGroupName for $global:accountAlias"
        $rgObj = New-AzureRmResourceGroup -Name $global:resourceGroupName -Location $global:location
        if ($? -eq $False) {
            echo "New-AzureRmResourceGroup fail"
            Exit 1
        }
    } else {
        echo "Resource group $global:resourceGroupName is already exist"
    }
}

function create_storage_accout_if_not_exist() {
    $global:storageAccoutName = $global:namePrefix + "storage"
    $storageAcc = Get-AzureRmStorageAccount -ResourceGroupName $global:resourceGroupName `
                                            -AccountName $global:storageAccoutName
    if ($? -eq $False) {
        echo "creating storage account $global:storageAccoutName for $global:resourceGroupName"
        $storageAcc = New-AzureRmStorageAccount -ResourceGroupName $global:resourceGroupName `
                                         -Name $global:storageAccoutName `
                                         -Location $global:location `
                                         -SkuName "Standard_GRS" `
                                         -Kind "Storage"
        Exit 1
    } else {
        echo "storage account $global:storageAccoutName is already exist"
    }
    $global:storageAccoutUrl = $storageAcc.PrimaryEndpoints.Blob
    echo $global:storageAccoutUrl
}

function upload_vm_img_to_storage_account([String] $localFilePath) {
    $ts = Get-Date -Format yyyy-MM-dd-HH-mm-ss
    $global:blobContainerName = "rocket-vhds/"
    $fileExists = Test-Path $localFilePath -PathType Leaf
    if ($fileExists) {
        $vhdName = [IO.Path]::GetFileNameWithoutExtension($localFilePath)
        $blobFileName = $vhdName + "-" + $ts + ".vhd"
        $destinationUri = $global:storageAccoutUrl + $global:blobContainerName + $blobFileName
        echo "uploading $localFilePath to $destinationUri"
        Add-AzureRmVhd -ResourceGroupName $global:resourceGroupName `
                       -Destination $destinationUri `
                       -LocalFilePath $localFilePath
        if ($? -eq $False) {
            echo "Add-AzureRmVhd failed"
        } else {
            echo "upload complete"
            $global:uploadedVhdUri = $destinationUri
        }
    } else {
        echo "$localFilePath does not exit"
    }
}

function setup_vnet_if_not_exist () {
    ## TODO: check vnet subset capacity
    $vnetName = $global:namePrefix + "vnet"
    $vnetAddressPrefix = "10.0.0.0/16"

    $vnetSubnetConfigName = $global:namePrefix + "subnet"
    $vnetSubnetAddressPrefix = "10.0.0.0/24"
    $vnetSubnetConfig = New-AzureRmVirtualNetworkSubnetConfig -Name $vnetSubnetConfigName `
                                                -AddressPrefix $vnetSubnetAddressPrefix
    if ($? -eq $False) {
        echo "New-AzureRmVirtualNetworkSubnetConfig fail"
        Exit 1
    }

    $vnetObj = Get-AzureRmVirtualNetwork -Name $vnetName -ResourceGroupName $global:resourceGroupName
    if ($? -eq $False) {
        echo "Creating virtual network $vnetName for resource group $global:resourceGroupName"
        $vnetObj = New-AzureRmVirtualNetwork -Name $vnetName `
                            -ResourceGroupName $global:resourceGroupName `
                            -Location $global:location `
                            -AddressPrefix $vnetAddressPrefix `
                            -Subnet $vnetSubnetConfig
        if ($? -eq $False) {
            echo "New-AzureRmVirtualNetwork fail"
            Exit 1
        }
    } else {
        echo "Virtual network $vnetName exists"
    }
    $global:vnet = $vnetObj
}

function setup_and_deploy_vm (
    [String] $adminUsername,
    [String] $adminPassword,
    [String] $vmName,
    [String] $computerName,
    [String] $vmSize
    ) {

    $vmObj = Get-AzureRmVM -Name $vmName -ResourceGroupName $global:resourceGroupName
    if ($? -eq $False) {
        $vmPipName = $vmName + "pip"
        $vmNicName = $vmName + "nic"
        $vmPip = New-AzureRmPublicIpAddress -Name $vmPipName `
                            -ResourceGroupName $global:resourceGroupName `
                            -Location $global:location -AllocationMethod Dynamic
        if ($? -eq $False) {
            echo "New-AzureRmPublicIpAddress fail"
            Exit 1
        }

        $vmNic = New-AzureRmNetworkInterface -Name $vmNicName `
                            -ResourceGroupName $global:resourceGroupName `
                            -Location $global:location `
                            -SubnetId $global:vnet.Subnets[0].Id `
                            -PublicIpAddressId $vmPip.Id
        if ($? -eq $False) {
            echo "New-AzureRmNetworkInterface fail"
            Exit 1
        }

        $vmConfig = New-AzureRmVMConfig -VMName $vmName -VMSize $vmSize
        if ($? -eq $False) {
            echo "New-AzureRmVMConfig fail"
            Exit 1
        }

        echo "Setting VM Operating System..."
        $vmCrededntial = create_credential $adminUsername $adminPassword
        $vmObj = Set-AzureRmVMOperatingSystem -VM $vmConfig -Linux `
                                    -ComputerName $computerName `
                                    -Credential $vmCrededntial
        if ($? -eq $False) {
            echo "Set-AzureRmVMOperatingSystem fail"
            Exit 1
        }
        echo "Done."

        echo "Setting VM Network Interface..."
        $vmObj = Add-AzureRmVMNetworkInterface -VM $vmObj -Id $vmNic.Id
        if ($? -eq $False) {
            echo "Add-AzureRmVMNetworkInterface fail"
            Exit 1
        }
        echo "Done."

        echo "Setting VM Operating Disk..."
        $vmOsDiskName = $vmName + "disk"
        $vmOsDiskUri = $global:storageAccoutUrl + $global:blobContainerName + $vmOsDiskName + ".vhd"
        $urlOfUploadedImageVhd = "https://yachenstorage.blob.core.windows.net/yachencustimg/freebsd103.vhd"
        #$urlOfUploadedImageVhd = $global:uploadedVhdUri

        $vmObj = Set-AzureRmVMOSDisk -VM $vmObj -Name $vmOsDiskName -VhdUri $vmOsDiskUri `
                    -CreateOption fromImage -SourceImageUri $urlOfUploadedImageVhd -Linux
        if ($? -eq $False) {
            echo "Set-AzureRmVMOSDisk fail"
            Exit 1
        }
        echo "Done."

        echo "Deploying VM..."
        $vmInstance = New-AzureRmVM -ResourceGroupName $global:resourceGroupName `
                                -Location $global:location -VM $vmObj
        if ($? -eq $False) {
            echo "New-AzureRmVM fail"
            Exit 1
        }
        echo "Done."

        echo $vmPip.Id
        echo $vmPip
        echo $vmInstance
    } else {
        echo "$vmName already exists in $global:resourceGroupName"
        Exit 1
    }
}

login_azure

create_resource_group_if_not_exist

create_storage_accout_if_not_exist

#upload_vm_img_to_storage_account

setup_vnet_if_not_exist

setup_and_deploy_vm "haha" "haha123" "hahavm" "hahapc" "Standard_A1"

exit 0