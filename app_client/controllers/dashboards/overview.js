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

function vmLocMapDrawerCtrl($scope) {
    $scope.$on("vmDataPrepared", function (event, args) {
        var counts = {};
        $scope.vmData.forEach(function(vmObj) { counts[vmObj.location] = (counts[vmObj.location] || 0) + 1; });
        var markers = [];
        var data = [];
        for (var key in counts) {
            markers.push({latLng: [$scope.locData[key].latitude, $scope.locData[key].longitude],
                name: $scope.locData[key].displayName});
            data.push(counts[key]);
        }

        $scope.$broadcast("mapDataPrepared", {markers: markers, data: data});
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

function lastMonthCostCtrl($scope, billingService) {
    var rST = moment().startOf('day').subtract(1, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    var rET = moment().startOf('day').subtract(1, 'day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    billingService.getBillingFunc(rST, rET)
        .success(function (data) {
            var totalCosts = 0;
            for (var i = 0; i < data.length; i++) {
                totalCosts += data[i].totalCost;
            }
            $scope.monthlyCost = totalCosts;
        })
        .error(function (err) {
            console.log(err);
            $scope.monthlyCost = 0;
        });
};

function todayResUsageCtrl($scope, billingService) {
    var rST = moment().startOf('day').subtract(2, 'day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    var rET = moment().startOf('day').subtract(1, 'day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    billingService.getBillingFunc(rST, rET)
        .success(function (data) {
            var storageCnt = 0;
            var sqlDBCnt = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].resourceType === "Microsoft.Sql/servers")
                    sqlDBCnt++;
                else if (data[i].resourceType === "Microsoft.Storage/storageAccounts")
                    storageCnt++;
            }
            $scope.storageCnt = storageCnt;
            $scope.sqlDBCnt = sqlDBCnt;
        })
        .error(function (err) {
            console.log(err);
            $scope.storageCnt = 0;
            $scope.sqlDBCnt = 0;
        });
}

function pastHalfYearCostCtrl($scope, billingService) {
    var halfYearData = [];
    async.series([
        function(callback) {
            var rST = moment().startOf('day').subtract(6, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(5, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(6, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            var rST = moment().startOf('day').subtract(5, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(4, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(5, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            var rST = moment().startOf('day').subtract(4, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(3, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(4, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            var rST = moment().startOf('day').subtract(3, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(2, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(3, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            var rST = moment().startOf('day').subtract(2, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(1, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(2, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            var rST = moment().startOf('day').subtract(1, 'month').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rET = moment().startOf('day').subtract(1, 'day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
            var rKey = moment().startOf('day').subtract(1, 'month').utc().format("YYYY-MM").toString();

            billingService.getBillingFunc(rST, rET)
                .success(function (data) {
                    var totalCosts = 0;
                    for (var i = 0; i < data.length; i++) {
                        totalCosts += data[i].totalCost;
                    }
                    halfYearData.push({key: rKey, value: totalCosts});
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        }
    ],
    // optional callback
    function(err) {
        if (err) {
            console.log("pastHalfYearCostCtrl" + err);
        } else {
            var lineData = {
                labels: [],
                datasets: [
                    {
                        label: "half-year cost dataset",
                        fillColor: "rgba(26,179,148,0.5)",
                        strokeColor: "rgba(26,179,148,0.7)",
                        pointColor: "rgba(26,179,148,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(26,179,148,1)",
                        data: []
                    }
                ]
            };

            var totalHalfYearCosts = 0;
            for (var i = 0; i < halfYearData.length; i++) {
                lineData.labels.push(halfYearData[i].key);
                totalHalfYearCosts += halfYearData[i].value;
                lineData.datasets[0].data.push(halfYearData[i].value.toFixed(0));
            }
            $scope.lineData = lineData;
            $scope.totalHalfYearCosts = totalHalfYearCosts;
            $scope.lastMonthCosts = halfYearData[halfYearData.length - 1].value;

            $scope.lineOptions = {
                scaleShowGridLines : true,
                scaleGridLineColor : "rgba(0,0,0,.05)",
                scaleGridLineWidth : 1,
                bezierCurve : true,
                bezierCurveTension : 0.4,
                pointDot : true,
                pointDotRadius : 4,
                pointDotStrokeWidth : 1,
                pointHitDetectionRadius : 20,
                datasetStroke : true,
                datasetStrokeWidth : 2,
                datasetFill : true
            };
        }
    });
}

angular
    .module('inspinia')
    .controller('vmDataCtrl', vmDataCtrl)
    .controller('vmLocDistDrawerCtrl', vmLocDistDrawerCtrl)
    .controller('vmUsageCtrl', vmUsageCtrl)
    .controller('vmLocMapDrawerCtrl', vmLocMapDrawerCtrl)
    .controller('lastMonthCostCtrl', lastMonthCostCtrl)
    .controller('todayResUsageCtrl', todayResUsageCtrl)
    .controller('pastHalfYearCostCtrl', pastHalfYearCostCtrl);