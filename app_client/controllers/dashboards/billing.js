var nameMapping = [];

// name, cost
function whoToBlame(billingInfo) {
    var blameInfo = [ {name: 'unknown', cost: 0} ];
    var ret = [];
    for (var i = 0; i < billingInfo.length; i++) {
        var found = false;
        if (typeof billingInfo[i].resourceName === "string") {
            for (var j = 0; j < nameMapping.length; j++) {
                if (billingInfo[i].resourceName.toLowerCase().startsWith(nameMapping[j].prefix) ||
                    billingInfo[i].resourceGroup.toLowerCase().includes(nameMapping[j].prefix)) {
                    found = true;
                    if (typeof blameInfo[j + 1] === "undefined") {
                        blameInfo[j + 1] = {name: nameMapping[j].alias, cost: billingInfo[i].totalCost};
                    } else {
                        blameInfo[j + 1].cost += billingInfo[i].totalCost;
                    }
                    break;
                }
            }
        }
        if (!found) {
            blameInfo[0].cost += billingInfo[i].totalCost;
        }
    }
    for (var i = 0; i < blameInfo.length; i++) {
        if (typeof blameInfo[i] !== "undefined")
            ret.push(blameInfo[i]);
    }
    ret.sort( function(a,b) {return b.cost - a.cost} );
    return ret;
}

function billingCtrl($scope, $timeout, billingService, namingService) {
    var defaultEnd = moment().startOf('day');
    var defaultStart = moment().startOf('week');
    $scope.daterange = {startDate: defaultStart, endDate: defaultEnd};

    var startArg = defaultStart.utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
    var endArg = defaultEnd.utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();

    async.series([
        function(callback) {
            namingService.getNamingFunc()
                .success(function (data) {
                    nameMapping = data;
                    callback();
                })
                .error(function (err) {
                    callback(err);
                });
        },
        function(callback) {
            billingService.getBillingFunc(startArg, endArg)
                .success(function (data) {
                    $scope.billingInfo = data;
                    $scope.blameInfo = whoToBlame(data);
                    $timeout(function () {
                        $('.footable').trigger('footable_redraw');
                        callback();
                    }, 100);
                })
                .error(function (err) {
                    callback(err);
                });
        }
    ], function (err) {
        if (err) {
            console.log(err);
        }
    });

    $scope.queryCosts = function() {
        var startArg = $scope.daterange.startDate.utc().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ").toString();
        var endArg =$scope.daterange.endDate.utc().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ").toString();

        async.series([
            function(callback) {
                namingService.getNamingFunc()
                    .success(function (data) {
                        nameMapping = data;
                        callback();
                    })
                    .error(function (err) {
                        callback(err);
                    });
            },
            function(callback) {
                billingService.getBillingFunc(startArg, endArg)
                    .success(function (data) {
                        $scope.billingInfo = data;
                        $scope.blameInfo = whoToBlame(data);
                        $timeout(function () {
                            $('.footable').trigger('footable_redraw');
                            callback();
                        }, 100);
                    })
                    .error(function (err) {
                        callback(err);
                    });
            }
        ], function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
}

angular
    .module('inspinia')
    .controller('billingCtrl', billingCtrl);
