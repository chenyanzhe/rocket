function vmService($http) {
	return $http.get('/api/vm');
}

angular
    .module('inspinia')
    .service('vmService', vmService)