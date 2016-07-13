function deployCtrl($scope, $timeout) {
	$scope.finishOne = false;
	$timeout(function() {
        $scope.finishOne = true;
    }, 10000);
};

angular
    .module('inspinia')
    .controller('deployCtrl', deployCtrl)
