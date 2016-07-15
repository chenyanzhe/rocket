function vhdToUploadService($http) {
	return $http.get('/api/vhd_list');
}

function vhdUploadService($http) {
	this.uploadVhd = function(localpath) {
		return $http.get('/api/vhd_upload/' + localpath);
	}
}

function imgListService($http) {
	this.imgListFunc = function() {
		return $http.get('/api/img_list');
	}
}

function avaLocsService($http) {
	return $http.get('/api/ava_locs');
}

angular
    .module('inspinia')
    .service('vhdToUploadService', vhdToUploadService)
    .service('vhdUploadService', vhdUploadService)
    .service('imgListService', imgListService)
    .service('avaLocsService', avaLocsService)