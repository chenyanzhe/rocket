function vmDataCtrl($scope, vmFullService) {
	$scope.loadingChart = true;
	$scope.loadingAmount = true;

	vmFullService
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
		$scope.vmData.forEach(function(vmObj) { counts[vmObj.Location] = (counts[vmObj.Location] || 0) + 1; });
		var pieData = [];
		for (var key in counts) {
			pieData.push({label: key, data: counts[key]});
		}

		var pieDataStatic = [
	        {
	            label: "Sales 1",
	            data: 21
	        },
	        {
	            label: "Sales 2",
	            data: 3
	        },
	        {
	            label: "Sales 3",
	            data: 15
	        },
	        {
	            label: "Sales 4",
	            data: 52
	        }
	    ];

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

angular
    .module('inspinia')
    .controller('vmDataCtrl', vmDataCtrl)
    .controller('vmLocDistDrawerCtrl', vmLocDistDrawerCtrl)
    .controller('vmTotalAmountCtrl', vmTotalAmountCtrl)