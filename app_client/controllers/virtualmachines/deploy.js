function deployCtrl($scope, $timeout) {
	$scope.finishOne = false;
	$timeout(function() {
        $scope.finishOne = true;
    }, 10000);
};

function uploadCtrl($scope, $interval, vhdToUploadService, vhdUploadService) {
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

		// upload vhd
		console.log("uploading" + $scope.vhdToUpload[idx].name);

		vhdUploadService.uploadVhd($scope.vhdToUpload[idx].name)
			.success(function (data) {
				console.log("vhd uploaded");

				$scope.vhdToUpload[idx].uploading = false;
	            $scope.vhdToUpload[idx].buttonName = "Uploaded";
	            for (var i = 0; i < $scope.vhdToUpload.length; i++) {
					if (i != idx && $scope.vhdToUpload[i].buttonName === "Upload") {
						$scope.vhdToUpload[i].disabled = false;
					} else {
						$scope.vhdToUpload[idx].disabled = true;
					}
				}

			})
			.error(function (err) {
				console.log(err);
			});

		// loading upload button animation
		$scope.vhdToUpload[idx].uploading = 0.01;

		$interval(function() {
			$scope.vhdToUpload[idx].uploading += 0.01;
		}, 10000, 95);
	}
}

function chooseImageCtrl($scope) {
	
}

angular
    .module('inspinia')
    .controller('deployCtrl', deployCtrl)
    .controller('uploadCtrl', uploadCtrl)
    .controller('chooseImageCtrl', chooseImageCtrl)
