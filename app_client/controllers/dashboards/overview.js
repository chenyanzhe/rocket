function vmDataCtrl($scope, vmService) {
	$scope.loadingChart = true;
	$scope.loadingAmount = true;

	vmService
		.success(function (data) {
			console.log(data);
			$scope.$broadcast("vmDataPrepared", {
			});
		})
		.error(function (err) {
			console.log(err);
		});
};

function vmTotalAmountCtrl($scope) {
	$scope.$on("vmDataPrepared", function (event, args) {
		$scope.totalAmount = 235;
		$scope.loadingAmount = false;
	})
}

function vmLocDistDrawerCtrl($scope) {
	$scope.$on("vmDataPrepared", function (event, args) {
		var pieData = [
	        {
	            label: "Sales 1",
	            data: 21,
	            color: "#d3d3d3"
	        },
	        {
	            label: "Sales 2",
	            data: 3,
	            color: "#bababa"
	        },
	        {
	            label: "Sales 3",
	            data: 15,
	            color: "#79d2c0"
	        },
	        {
	            label: "Sales 4",
	            data: 52,
	            color: "#1ab394"
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