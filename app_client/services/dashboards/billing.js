function billingService($http) {
    this.getBillingFunc = function(start, end) {
        console.log(start, end);
        return $http.get('/api/billing/' + start + '/' + end);
    };
}

angular
    .module('inspinia')
    .service('billingService', billingService);
