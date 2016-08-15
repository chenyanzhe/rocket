function subscriptionService($http) {
    this.switchSub = function(subId) {
        return $http.get('/api/subscription/' + subId);
    }
}

angular
    .module('inspinia')
    .service('subscriptionService', subscriptionService);