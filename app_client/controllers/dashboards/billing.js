function billingCtrl($scope, $timeout, billingService) {
    $scope.daterange = {startDate: null, endDate: null};

    billingService
        .success(function (data) {
            $scope.billingInfo = data;
            $timeout(function () {
                $('.footable').trigger('footable_redraw');
            }, 100);
        })
        .error(function (err) {
            console.log(err);
        });

    $scope.queryCosts = function() {
        var start = new Date($scope.daterange.startDate);
        var end = new Date($scope.daterange.endDate);
        console.log("startDate: " + start.toDateString());
        console.log("endDate: " + end.toDateString());
    }
};

angular
    .module('inspinia')
    .controller('billingCtrl', billingCtrl)
