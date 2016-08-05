param (
    [switch]$force # will overwrite existing settings
);

# logout existing users
$_ = azure account show --json 2>&1
if ($? -eq $True) {
    $existingUsers = $_ | ConvertFrom-Json

    For ($i = 0; $i -lt $existingUsers.Length; $i++) {
        Write-Host -NoNewline 'Logout existing user:' $existingUsers[$i].user.name '... '
        $_ = azure logout -u $existingUsers[$i].user.name
        Write-Host 'Done'
    }
}

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

    ###################### Check Duplicates ######################
    $adAppObj = azure ad app show --identifierUri $identifierUri --json
    if ($adAppObj -ne '{}') {
        $adAppObj = $adAppObj | ConvertFrom-Json
        Write-Host "`tActive directory already exists"
        if ($force) {
            $objectId = $adAppObj.objectId
            Write-Host -NoNewline "`tDeleting active directory ... "
            $_ = azure ad app delete --objectId $objectId --quiet
            Write-Host 'Done'
        } else {
            Write-Host 'Use -force option to overwrite'
            continue
        }
    }

    ###################### Active Directory ######################
    Write-Host -NoNewline "`tCreating active directory ... "
    $adAppObj = (azure ad app create -n $adAppName -p $password --home-page $homepage -i $identifierUri --json) | ConvertFrom-Json
    Write-Host 'Done'

    ###################### Service Principle ######################
    Write-Host -NoNewline "`tCreating service principle ... "
    $adAppId = $adAppObj.appId
    $_ = (azure ad sp create --applicationId $adAppId --json) | ConvertFrom-Json
    Start-Sleep -s 5 # it is necessary sometimes
    Write-Host 'Done'

    ###################### Role Assignment ######################
    Write-Host -NoNewline "`tCreating role ... "
    $_ = azure role assignment create --spn $identifierUri --roleName 'Contributor' --subscription $subscriptionId
    Write-Host 'Done'

    Write-Host 'Login command:'
    Write-Host "`tazure login -u" $adAppId '-p' $password '--service-principal --tenant' $tenantId
}