function vmListService($http) {
	return $http.get('/api/vm_list');
}

function geoLocService($http) {
    return $http.get('/api/location');
}

function vmUsageService($http) {
	this.getVMUsage = function(location) {
		return $http.get('/api/vm_usage/' + location);
	}
}

angular
    .module('inspinia')
    .service('vmListService', vmListService)
    .service('vmUsageService', vmUsageService)
    .service('geoLocService', geoLocService)