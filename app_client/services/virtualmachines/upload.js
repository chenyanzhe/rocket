function vhdToUploadService($http) {
	return $http.get('/api/vhd_list');
}

angular
    .module('inspinia')
    .service('vhdToUploadService', vhdToUploadService)