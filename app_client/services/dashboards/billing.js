function billingService($http) {
    return $http.get('/api/billing');
}

angular
    .module('inspinia')
    .service('billingService', billingService);
