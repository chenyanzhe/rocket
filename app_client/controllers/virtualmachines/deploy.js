function deployCtrl($scope) {
	$scope.data = {};
	$scope.data.finishStepOne = false;
	$scope.data.finsihStepTwo = false;
	$scope.data.imgList = [];
	$scope.data.imgChoosedIdx = -1;
	$scope.data.basicConfig = {};
	$scope.data.locList = [];
};

function uploadCtrl($scope, $interval, vhdToUploadService, vhdUploadService) {
	$scope.uploadData = {};
	$scope.uploadData.imgListLoading = false;
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

		$scope.uploadData.imgListLoading = true;

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

				$scope.uploadData.imgListLoading = false;
			})
			.error(function (err) {
				console.log(err);
				$scope.uploadData.imgListLoading = false;
			});

		// loading upload button animation
		$scope.vhdToUpload[idx].uploading = 0.01;

		$interval(function() {
			$scope.vhdToUpload[idx].uploading += 0.01;
		}, 10000, 95);
	}
}

function chooseImageCtrl($scope, imgListService) {
	$scope.uploadData.imgListLoading = true;
	imgListService.imgListFunc()
		.success(function (data) {
			// init data and states
			$scope.data.imgList = data;
			$scope.data.imgChoosedIdx = -1;
			$scope.data.finishStepOne = false;

			// inject some properties
			for (var i = 0; i < $scope.data.imgList.length; i++) {
				$scope.data.imgList[i].buttonName = "Choose";
				$scope.data.imgList[i].isChosen = false;
			}
			$scope.uploadData.imgListLoading = false;
		})
		.error(function (err) {
			console.log(err);
		});

	$scope.chooseImgClicked = function(idx) {
		$scope.data.imgChoosedIdx = idx;
		// change style of clicked button
		for (var i = 0; i < $scope.data.imgList.length; i++) {
			if (i != idx) {
				$scope.data.imgList[i].buttonName = "Choose";
				$scope.data.imgList[i].isChosen = false;
			} else {
				$scope.data.imgList[idx].buttonName = "Choosed";
				$scope.data.imgList[i].isChosen = true;
			}
		}
		$scope.data.finishStepOne = true;
	}

	$scope.refreshImgList = function() {
		$scope.uploadData.imgListLoading = true;
		imgListService.imgListFunc()
			.success(function (data) {
				// init data and states
				$scope.data.imgList = data;
				$scope.data.imgChoosedIdx = -1;
				$scope.data.finishStepOne = false;

				// inject some properties
				for (var i = 0; i < $scope.data.imgList.length; i++) {
					$scope.data.imgList[i].buttonName = "Choose";
					$scope.data.imgList[i].isChosen = false;
				}
				$scope.uploadData.imgListLoading = false;
			})
			.error(function (err) {
				console.log(err);
			});
	}
}

function basicConfigCtrl($scope, avaLocsService) {
	avaLocsService
		.success(function (data) {
			$scope.data.locList = data;
		})
		.error(function (err) {
			console.log(err);
		});
}

angular
    .module('inspinia')
    .controller('deployCtrl', deployCtrl)
    .controller('uploadCtrl', uploadCtrl)
    .controller('chooseImageCtrl', chooseImageCtrl)
    .controller('basicConfigCtrl', basicConfigCtrl)
