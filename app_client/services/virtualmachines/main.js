function vmFullService($http) {
	return $http.get('/api/vm_full');
}

angular
    .module('inspinia')
    .service('vmFullService', vmFullService)