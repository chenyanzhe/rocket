function vmListService($http) {
    this.getVMList = function() {
        return $http.get('/api/vm_list');
    }
}

function geoLocService($http) {
    this.getGeoLoc = function() {
        return $http.get('/api/location');
    }
}

function vmUsageService($http) {
	this.getVMUsage = function(location) {
		return $http.get('/api/vm_usage/' + location);
	}
}

function switchSubscriptionService($http) {
    this.switchSub = function(subId) {
        return $http.get('/api/subscription/' + subId);
    }
}

angular
    .module('inspinia')
    .service('vmListService', vmListService)
    .service('vmUsageService', vmUsageService)
    .service('geoLocService', geoLocService)
    .service('switchSubscriptionService', switchSubscriptionService)