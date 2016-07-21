function billingCtrl($scope, $timeout, billingService) {
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
};

angular
    .module('inspinia')
    .controller('billingCtrl', billingCtrl)
