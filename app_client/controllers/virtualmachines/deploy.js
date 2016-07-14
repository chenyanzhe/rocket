function deployCtrl($scope, $timeout) {
	$scope.finishOne = false;
	$timeout(function() {
        $scope.finishOne = true;
    }, 10000);
};

function uploadCtrl($scope, $timeout, vhdToUploadService) {
	$scope.vhdToUploadLoading = true;
	vhdToUploadService
		.success(function (data) {
			$scope.vhdToUpload = data;
			// inject some properties
			for (var i = 0; i < $scope.vhdToUpload.length; i++) {
				$scope.vhdToUpload[i].disabled = false;
				$scope.vhdToUpload[i].buttonName = "Upload";
				$scope.vhdToUpload[i].uploading = false;
			}
			$scope.vhdToUploadLoading = false;
		})
		.error(function (err) {
			console.log(err);
		});

	$scope.uploadClicked = function(idx) {
		$scope.vhdToUpload[idx].buttonName = "Uploading";
		// disable all other upload buttons
		for (var i = 0; i < $scope.vhdToUpload.length; i++) {
			if (i != idx) {
				$scope.vhdToUpload[i].disabled = true;
			}
		}

		$timeout(function() {
            $scope.vhdToUpload[idx].uploading = 0.1;
        }, 500);
		$timeout(function() {
            $scope.vhdToUpload[idx].uploading += 0.2;
        }, 1000);
        $timeout(function() {
            $scope.vhdToUpload[idx].uploading += 0.2;
        }, 2000);
        $timeout(function() {
            $scope.vhdToUpload[idx].uploading += 0.2;
        }, 3000);
        $timeout(function() {
            $scope.vhdToUpload[idx].uploading += 0.2;
        }, 4000);

        $timeout(function() {
            $scope.vhdToUpload[idx].uploading = false;
            $scope.vhdToUpload[idx].buttonName = "Uploaded";
            for (var i = 0; i < $scope.vhdToUpload.length; i++) {
				if (i != idx && $scope.vhdToUpload[i].buttonName === "Upload") {
					$scope.vhdToUpload[i].disabled = false;
				} else {
					$scope.vhdToUpload[idx].disabled = true;
				}
			}
        }, 5000);

		// do the real upload things
	}
}

angular
    .module('inspinia')
    .controller('deployCtrl', deployCtrl)
    .controller('uploadCtrl', uploadCtrl)
