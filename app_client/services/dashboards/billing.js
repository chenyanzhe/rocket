function billingService($http) {
    this.getBillingFunc = function(start, end) {
        console.log(start, end);
        return $http.get('/api/billing/' + start + '/' + end);
    };
}

function namingService($http) {
    this.getNamingFunc = function() {
        return $http.get('/api/name_list');
    };
}

angular
    .module('inspinia')
    .service('billingService', billingService)
    .service('namingService', namingService);
