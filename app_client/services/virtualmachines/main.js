function vmFullService($http) {
	return $http.get('/api/vm_full');
}

function vmLocsService($http) {
	return $http.get('/api/vm_locs');
}

angular
    .module('inspinia')
    .service('vmFullService', vmFullService)
    .service('vmLocsService', vmLocsService)