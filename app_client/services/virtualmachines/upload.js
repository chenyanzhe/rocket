function vhdToUploadService($http) {
	return $http.get('/api/vhd_list');
}

function vhdUploadService($http) {
	this.uploadVhd = function(localpath) {
		return $http.get('/api/vhd_upload/' + localpath);
	}
}

function imgListService($http) {
	return $http.get('/api/img_list');
}

angular
    .module('inspinia')
    .service('vhdToUploadService', vhdToUploadService)
    .service('vhdUploadService', vhdUploadService)
    .service('imgListService', imgListService)