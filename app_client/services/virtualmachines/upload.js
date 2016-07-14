function vhdToUploadService($http) {
	return $http.get('/api/vhd_list');
}

function vhdUploadService($http) {
	this.uploadVhd = function(localpath) {
		return $http.get('/api/vhd_upload/' + localpath);
	}
}

angular
    .module('inspinia')
    .service('vhdToUploadService', vhdToUploadService)
    .service('vhdUploadService', vhdUploadService)