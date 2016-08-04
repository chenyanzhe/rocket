azure login

$accountList = (azure account list --json) | ConvertFrom-Json

For ($i = 0; $i -lt $accountList.Length; $i++) {
    $account = $accountList[$i]

    $tenantId = $account.tenantId
    $subscriptionId = $account.id
    $subscriptionName = $account.name

    Write-Host 'Creating account for' $subscriptionName '...'

    $username = $account.user.name

    $alias, $_ = $username -split '@', 2
    $alias = $alias.Replace('-','')

    $_ = azure account set $subscriptionId

    $password = ([char[]]([char]'a'..[char]'z') + 0..9 | sort {get-random})[0..32] -join ''
    $adAppName = 'RocketAdApp_' + $subscriptionId + '_' + $alias
    $homepage = 'http://' + $adAppName
    $identifierUri = $homepage
    $adAppObj = (azure ad app show --identifierUri $identifierUri --json) | ConvertFrom-Json
    if (!$adAppObj) {
        Write-Host $identifierUri 'already exists' $adAppObj
        continue;
    }

    $adAppObj = (azure ad app create -n $adAppName -p $password --home-page $homepage -i $identifierUri --json) | ConvertFrom-Json
    $adAppId = $adAppObj.appId

    Write-Host 'Creating active directory ...'
    $_ = azure ad sp create --applicationId $adAppId
    Write-Host 'Done!'

    Write-Host 'Assigning role ...'
    $_ = azure role assignment create --spn $identifierUri --roleName 'Contributor' --subscription $subscriptionId
    Write-Host 'Done!'

    Write-Host 'Login command:'
    Write-Host '    azure login -u' $adAppId '-p' $password '--service-principal --tenant' $tenantId
}