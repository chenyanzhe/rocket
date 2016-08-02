function vmDataCtrl($scope, vmListService, geoLocService) {
	$scope.loadingChart = true;
	$scope.loadingUsage = true;

    async.parallel([
        function(callback) {
            vmListService
                .success(function (data) {
                    $scope.vmData = data;
                    $scope.totalAmount = data.length;
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            geoLocService
                .success(function (data) {
                    $scope.locData = {};
                    for (var i = 0; i < data.length; i++) {
                        $scope.locData[data[i].name] = data[i];
                    }
                    callback();
                })
                .error(function (err) {
                    callback(err);
                })
        }
    ],
    // optional callback
    function(err, results) {
        if (err) {
            console.log("vmDataCtrl" + err);
        } else {
            $scope.$broadcast("vmDataPrepared", {});
        }
    });
};

function vmLocDistDrawerCtrl($scope) {
	$scope.$on("vmDataPrepared", function (event, args) {
		var counts = {};
		$scope.vmData.forEach(function(vmObj) { counts[vmObj.location] = (counts[vmObj.location] || 0) + 1; });
		var pieData = [];
		for (var key in counts) {
			pieData.push({label: $scope.locData[key].displayName, data: counts[key]});
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
    .controller('vmUsageCtrl', vmUsageCtrl)