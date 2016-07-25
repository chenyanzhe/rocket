module.exports.getUsage = function () {
    var request = require("request");
    var async = require('async');
    var mongoose = require('mongoose');
    var Sub = mongoose.model('Subscription');
    var Usg = mongoose.model('Usage');

    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var cToken = '';

        function getAggregatedUsageHelper(cb) {

            var options = { method: 'GET',
                url: 'https://management.azure.com/subscriptions/' + subItem.subscriptionId + '/providers/Microsoft.Commerce/UsageAggregates',
                qs: {
                    'api-version': '2015-06-01-preview',
                    reportedStartTime: '2016-07-20T00:00:00+00:00',
                    reportedEndTime: '2016-07-20T03:00:00+00:00',
                    aggregationGranularity: 'Hourly',
                    showDetails: 'true'
                },
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    authorization: global.access_token
                }
            };

            if (cToken != '') options.qs.continuationToken = cToken;

            request(options, function (error, res, body) {
                if (error) throw new Error(error);
                var usageSegment = JSON.parse(body);
                if (usageSegment.nextLink) {
                    var idx = usageSegment.nextLink.lastIndexOf("=");
                    cToken = usageSegment.nextLink.substr(idx + 1);
                    cToken = decodeURIComponent(cToken);
                } else {
                    cToken = '';
                }
                console.log("One page done!");
                cb(null);
            });
        }

        function hasNextPage () {
            return cToken != '';
        }

        async.doWhilst(
            getAggregatedUsageHelper,
            hasNextPage,
            function (err) {
                if (err) {
                    console.log("async doWhilst err", err);
                    return;
                }
                cb(null);
            }
        );

    }).on('error', function (err) {
        console.log("\tFail to get usageItem", err);
    }).on('close', function (){
        // console.log("\tfinish updating usage on all subscriptions");
    });
};