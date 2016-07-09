function dashboardOverviewCtrl($scope, resourceGroups) {
	// $scope.loading = true;
	// resourceGroups
	// 	.success(function(data) {
	// 		$scope.data = {
	// 			resourceGroupsData: 12345
	// 		}
	// 		$scope.$broadcast("resourceGroupsDataPrepared", {
	// 		})
	// 	})
	// 	.error(function(err) {
	// 		console.log("err ...");
	// 	})
}

function dashboardOverviewTotalResourceGroupsCtrl($scope) {
	// $scope.$on("resourceGroupsDataPrepared", function(event, args) {
	// 	$scope.totalResourceGroups = $scope.data.resourceGroupsData * 2
	// 	$scope.loading = false;
	// });
}

angular
	.module('inspinia')
	.controller('dashboardOverviewCtrl', dashboardOverviewCtrl)
	.controller('dashboardOverviewTotalResourceGroupsCtrl', dashboardOverviewTotalResourceGroupsCtrl);