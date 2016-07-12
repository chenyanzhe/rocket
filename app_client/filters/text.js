function locationNameFormat () {
	return function (name) {
		var nameMapping = {
			"japanwest": "Japan West",
			"eastasia": "East Asia",
			"centralus": "Central US",
			"eastus": "East US",
			"eastus2": "East US 2",
			"westus": "West US",
			"northcentralus": "North Central US",
			"southcentralus": "South Central US",
			"northeurope": "North Europe",
			"westeurope": "West Europe",
			"southeastasia": "Southeast Asia",
			"japaneast": "Japan East",
			"brazilsouth": "Brazil South",
			"australiaeast": "Australia East",
			"sustraliasoutheast": "Australia Southeast",
			"southindia": "South India",
			"centralindia": "Central India",
			"westindia": "West India",
			"canadacentral": "Canada Central",
			"canadaeast": "Canada East"
		};
		if (name in nameMapping) {
			return nameMapping[name];
		} else {
			return "Unknown";
		}
	}
}

angular
    .module('inspinia')
    .filter('locationNameFormat', locationNameFormat)