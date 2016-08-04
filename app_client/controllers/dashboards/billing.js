var nameMapping = [
    { prefix: 'abel', alias: 'abel' },
    { prefix: 'andy', alias: 'xiazhang' },
    { prefix: 'liz', alias: 'lizzha' },
    { prefix: 'likezh', alias: 'likezh' },
    { prefix: 'qingfu', alias: 'qingfu' },
    { prefix: 'minli', alias: 'minli' },
    { prefix: 'harpal', alias: 'v-harpal' },
    { prefix: 'lili', alias: 'v-lide' },
    { prefix: 'kx', alias: 'v-kaxiao' },
    { prefix: 'yz', alias: 'yuezha' },
    { prefix: 'binxi', alias: 'binxi' },
    { prefix: 'andliu', alias: 'andliu' },
    { prefix: 'decui', alias: 'decui' },
    { prefix: 'thomas', alias: 'huishao' },
    { prefix: 'scott', alias: 'mingzhan' },
    { prefix: 'wei', alias: 'v-lii' },
    { prefix: 'xhx', alias: 'v-hoxian' },
    { prefix: 'ica', alias: 'CLOUD' },
    { prefix: 'azperf', alias: 'PERF' },
    { prefix: 'testimage', alias: 'TestImage' },
    { prefix: 'av', alias: 'v-avchat' },
    { prefix: 'ram', alias: 'v-ranmut' },
    { prefix: 'siva', alias: 'v-sirebb' },
    { prefix: 'srm', alias: 'v-srm' },
    { prefix: 'ss', alias: 'v-shisav' },
    { prefix: 'andy', alias: 'v-feile' },
    { prefix: 'zhongyi', alias: 'v-zhongz' },
    { prefix: 'jm', alias: 'jinmiao' },
    { prefix: 'guwe', alias: 'guwe' },
    { prefix: 'doliu', alias: 'doliu' },
    { prefix: 'joey', alias: 'v-shuihe' },
    { prefix: 'honzhan', alias: 'honzhan' },
    { prefix: 'shostc', alias: 'shostc' },
    { prefix: 'jish', alias: 't-jish'},
    { prefix: 'yachen', alisa: 't-yachen'}
];

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

function billingCtrl($scope, $timeout, billingService) {
    var defaultEnd = moment().startOf('day');
    var defaultStart = moment().startOf('week');
    $scope.daterange = {startDate: defaultStart, endDate: defaultEnd};

    var startArg = defaultStart.utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
    var endArg = defaultEnd.utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
    billingService.getBillingFunc(startArg, endArg)
        .success(function (data) {
            $scope.billingInfo = data;
            $scope.blameInfo = whoToBlame(data);
            $timeout(function () {
                $('.footable').trigger('footable_redraw');
            }, 100);
        })
        .error(function (err) {
            console.log(err);
        });

    $scope.queryCosts = function() {
        var startArg = $scope.daterange.startDate.utc().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ").toString();
        var endArg =$scope.daterange.endDate.utc().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ").toString();
        billingService.getBillingFunc(startArg, endArg)
            .success(function (data) {
                $('.footable').trigger('footable_initialize');
                $scope.billingInfo = data;
                $scope.blameInfo = whoToBlame(data);
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
