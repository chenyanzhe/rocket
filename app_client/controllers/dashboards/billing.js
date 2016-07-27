function billingCtrl($scope, $timeout, billingService) {
    var defaultEnd = moment().startOf('day');
    var defaultStart = moment(defaultEnd).subtract(1, 'week');
    $scope.daterange = {startDate: defaultStart, endDate: defaultEnd};

    var startArg = defaultStart.utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    var endArg = defaultEnd.utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    billingService.getBillingFunc(startArg, endArg)
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
        var startArg = $scope.daterange.startDate.startOf('day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
        var endArg =$scope.daterange.endDate.startOf('day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
        billingService.getBillingFunc(startArg, endArg)
            .success(function (data) {
                $('.footable').trigger('footable_initialize');
                $scope.billingInfo = data;
                $timeout(function () {
                    $('.footable').trigger('footable_redraw');
                }, 100);
            })
            .error(function (err) {
                console.log(err);
            });
    }
};

angular
    .module('inspinia')
    .controller('billingCtrl', billingCtrl)
