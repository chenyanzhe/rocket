// FIXME: it should only maintianed in filter
function locationNameFormatUtil (name) {
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


function vmDataCtrl($scope, vmListService) {
	$scope.loadingChart = true;
	$scope.loadingAmount = true;
	$scope.loadingUsage = true;

	vmListService
		.success(function (data) {
			$scope.vmData = data;
			$scope.$broadcast("vmDataPrepared", {
			});
		})
		.error(function (err) {
			console.log(err);
		});
};

function vmTotalAmountCtrl($scope) {
	$scope.$on("vmDataPrepared", function (event, args) {
		$scope.totalAmount = $scope.vmData.length;
		$scope.loadingAmount = false;
	})
}

function vmLocDistDrawerCtrl($scope) {
	$scope.$on("vmDataPrepared", function (event, args) {
		var counts = {};
		$scope.vmData.forEach(function(vmObj) { counts[vmObj.location] = (counts[vmObj.location] || 0) + 1; });
		var pieData = [];
		for (var key in counts) {
			pieData.push({label: locationNameFormatUtil(key), data: counts[key]});
		}

	    var pieOptions = {
	        series: {
	            pie: {
	                show: true
	            }
	        },
	        grid: {
	            hoverable: true
	        },
	        tooltip: true,
	        tooltipOpts: {
	            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
	            shifts: {
	                x: 20,
	                y: 0
	            },
	            defaultTheme: false
	        }
	    };

	    $scope.flotPieData = pieData;
    	$scope.flotPieOptions = pieOptions;

    	$scope.loadingChart = false;
	})
};

function chunk(data) {
    var newData = [[], [], []];
    var colId = 0;
    for (var loc in data) {
        newData[colId].push({name: loc, status: data[loc]});
        colId++;
        colId = colId % 3;
    }
    return newData;
}

function vmUsageCtrl($scope, vmUsageService) {
	$scope.$on("vmDataPrepared", function (event, args) {
		var locsH = {};
		$scope.vmData.forEach(function(vmObj) { locsH[vmObj.location] = 0 });
		var locs = Object.keys(locsH);
		var locsAssem = locs.join("&");

		vmUsageService.getVMUsage(locsAssem)
			.success(function (data) {
                $scope.vmUsage = chunk(data);
                $scope.loadingUsage = false;
			})
			.error(function (err) {
				console.log(err);
			});
	})
};

angular
    .module('inspinia')
    .controller('vmDataCtrl', vmDataCtrl)
    .controller('vmLocDistDrawerCtrl', vmLocDistDrawerCtrl)
    .controller('vmTotalAmountCtrl', vmTotalAmountCtrl)
    .controller('vmUsageCtrl', vmUsageCtrl)