#### Create 

function get_alias_from_email([String] $email) {
   $alias, $domain = $email -split '@', 2
   $final_alias = $alias.Replace("-","")
   return $final_alias
}

function interactive_login() {
    $accountObj = Login-AzureRmAccount
    if ($? -eq $False) {
        echo "Login-AzureRmAccount fail"
        Exit 1
    }

    $global:accountId = $accountObj.Context.Account.Id
    $global:tenantId = $accountObj.Context.Tenant.TenantId 
    $global:subscriptionId = $accountObj.Context.Subscription.SubscriptionId
    $global:subscriptionName = $accountObj.Context.Subscription.SubscriptionName

    $global:accountAlias = get_alias_from_email($accountId)

    echo "interactive login successful"
    echo "accountId = $global:accountId"
    echo "tenantId = $global:tenantId"
    echo "subscriptionId = $global:subscriptionId"
    echo "subscriptionName = $global:subscriptionName"
    echo "accountAlias = $global:accountAlias"
}

function create_ad_application_if_not_exist([String] $alias) {
    $displayName = $alias + "rocketapp"
    $password = $alias + "123"

    $applicationObj = Get-AzureRmADApplication -DisplayNameStartWith $displayName
    if ($? -eq $False) {
        echo "Get-AzureRmADApplication fail"
        Exit 1
    }
    if ($applicationObj.length -eq 0) {
        echo "creating ad application $displayName"
        $homePage = "https://www." + $displayName + ".com"
        $identifierUris = $homePage + "/rocket"

        $applicationObj = New-AzureRmADApplication -DisplayName $displayName `
                            -HomePage $homePage -IdentifierUris $identifierUris `
                            -Password $password
        if ($? -eq $False) {
            echo "New-AzureRmADApplication fail"
            Exit 1
        }
    } else {
        echo "ad application $displayName already exists"
    }
    $global:applicationName = $displayName
    $global:applicationId = $applicationObj[0].ApplicationId.Guid
    $global:password = $password
    echo "applicationId = $global:applicationId"
}

function create_service_principal_if_not_exist() {
    $adServicePrincipalObj = Get-AzureRmADServicePrincipal -SearchString $global:applicationName
    if ($? -eq $False) {
        echo "Get-AzureRmADServicePrincipal fail"
        Exit 1
    }
    if ($adServicePrincipalObj.length -eq 0) {
        echo "creating ad service principal for $global:applicationName"
        New-AzureRmADServicePrincipal -ApplicationId $global:applicationId
        if ($? -eq $False) {
            echo "New-AzureRmADServicePrincipal fail"
            Exit 1
        }
    } else {
        echo "ad service principal for $global:applicationName already exists"
    }
}

function assign_role_if_not_exist() {
    ## TODO: need more strong check: check it has *OWNER* role
    $roleObj = Get-AzureRmRoleAssignment -ServicePrincipalName $global:applicationId
    if ($? -eq $False) {
        echo "Get-AzureRmRoleAssignment fail"
        Exit 1
    }
    if ($roleObj.length -eq 0) {
        echo "assigning owner role to $global:applicationName"
        New-AzureRmRoleAssignment -RoleDefinitionName Owner -ServicePrincipalName $global:applicationId
        if ($? -eq $False) {
            echo "New-AzureRmRoleAssignment fail"
            Exit 1
        }
    } else {
        echo "role for $global:applicationName already exists"
    }
}

function login_via_sp() {
    $securePassword = ConvertTo-SecureString $global:password -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential ($global:applicationId, $securePassword);
    Add-AzureRmAccount -Credential $cred -ServicePrincipal -TenantId $global:tenantId
    if ($? -eq $False) {
        echo "login via sp failed"
        Exit 1
    } else {
        echo "login via sp successful"
        echo "you could use the following info to assemble your next login"
        echo "applicationId = $global:applicationId"
        echo "password = $global:password"
        echo "tenantId = $global:tenantId"
    }
}

interactive_login
create_ad_application_if_not_exist $global:accountAlias
create_service_principal_if_not_exist
assign_role_if_not_exist
login_via_sp
