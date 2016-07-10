$rgName = "yachen"
$securePassword = ConvertTo-SecureString "yachenadapp123" -AsPlainText -Force
$applicationId = "e60de92b-ddf7-4f50-89a1-79c0b1189d5c"
$cred = New-Object System.Management.Automation.PSCredential ($applicationId, $securePassword);
$tenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47"
Add-AzureRmAccount -Credential $cred -ServicePrincipal -TenantId $tenantId


$VMLocalAdminUser = "yachenadmin"
$VMLocalAdminSecurePassword = ConvertTo-SecureString "yaCHEN123" -AsPlainText -Force
$VMCrededntial = New-Object System.Management.Automation.PSCredential ($VMLocalAdminUser, $VMLocalAdminSecurePassword);

$location = "westus"
$pipName = "yachenpip"
$subnetName = "yachensub"
$nicName = "yachennic"
$vnetName = "yachenvnet"
$vnetSubnetAddressPrefix = "10.0.0.0/24"
$vnetAddressPrefix = "10.0.0.0/16"

$pip = New-AzureRmPublicIpAddress -Name $pipName -ResourceGroupName $rgName -Location $location -AllocationMethod Dynamic
$subnetconfig = New-AzureRmVirtualNetworkSubnetConfig -Name $subnetName -AddressPrefix $vnetSubnetAddressPrefix
$vnet = New-AzureRmVirtualNetwork -Name $vnetName -ResourceGroupName $rgName -Location $location -AddressPrefix $vnetAddressPrefix -Subnet $subnetconfig
$nic = New-AzureRmNetworkInterface -Name $nicName -ResourceGroupName $rgName -Location $location -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $pip.Id

$vmName = "yachenupldvm"
$vmConfig = New-AzureRmVMConfig -VMName $vmName -VMSize "Standard_A4"
$computerName = "yachenupldcomp"
$vm = Set-AzureRmVMOperatingSystem -VM $vmConfig -Linux -ComputerName $computerName -Credential $VMCrededntial
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id

$osDiskName = "yachenupldos"
$storageAccName = "yachenstorage"
$storageAcc = Get-AzureRmStorageAccount -ResourceGroupName $rgName -AccountName $storageAccName
$osDiskUri = '{0}vhds/{1}{2}.vhd' -f $storageAcc.PrimaryEndpoints.Blob.ToString(), $vmName.ToLower(), $osDiskName
$urlOfUploadedImageVhd = "https://yachenstorage.blob.core.windows.net/yachencustimg/freebsd103.vhd"

$vm = Set-AzureRmVMOSDisk -VM $vm -Name $osDiskName -VhdUri $osDiskUri -CreateOption fromImage -SourceImageUri $urlOfUploadedImageVhd -Linux
$result = New-AzureRmVM -ResourceGroupName $rgName -Location $location -VM $vm
$result

#echo $osDiskUri