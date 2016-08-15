function subscriptionService($http) {
    this.subList = function() {
        return $http.get('/api/subscription');
    };

    this.switchSub = function(subId) {
        return $http.get('/api/subscription/' + subId);
    };
}

angular
    .module('inspinia')
    .service('subscriptionService', subscriptionService);