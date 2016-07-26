module.exports.getUsage = function () {
    var request = require("request");
    var async = require('async');
    var moment = require('moment');
    var mongoose = require('mongoose');
    var Sub = mongoose.model('Subscription');
    var HU = mongoose.model('HourlyUsage');

    //var rST = moment().subtract(2, 'hours').startOf('hour').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    //var rET = moment().subtract(1, 'hours').startOf('hour').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    var rST = '2016-07-21T00:00:00+00:00';
    var rET = '2016-07-25T00:00:00+00:00';
    console.log("\t" + rST + " - " + rET);
    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var cToken = '';
        var nPage = 0;
        function getAggregatedUsageHelper(cb) {

            var options = { method: 'GET',
                url: 'https://management.azure.com/subscriptions/' + subItem.subscriptionId + '/providers/Microsoft.Commerce/UsageAggregates',
                qs: {
                    'api-version': '2015-06-01-preview',
                    reportedStartTime: rST,
                    reportedEndTime: rET,
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
                nPage++;
                var useSegmentArr = usageSegment.value;
                var nInvalidData = 0;
                for (var i = 0; i < useSegmentArr.length; i++) {
                    var instData = useSegmentArr[i].properties.instanceData;
                    var infoData = useSegmentArr[i].properties.infoFields;
                    if (typeof instData === "undefined" &&
                        Object.keys(infoData).length === 0 &&
                        infoData.constructor === Object) {
                        // skip invalid data
                        nInvalidData++;
                        continue;
                    }
                    if (typeof instData === "undefined") {
                        // handle classic data
                        HU.update({
                                subscriptionId: subItem.subscriptionId,
                                resourceGroup: "classic",
                                resourceType: infoData.meteredService,
                                resourceName: infoData.project,
                                usageStartTime: new Date(useSegmentArr[i].properties.usageStartTime),
                                usageEndTime: new Date(useSegmentArr[i].properties.usageEndTime),
                                meterId: useSegmentArr[i].properties.meterId
                            },
                            {
                                subscriptionId: subItem.subscriptionId,
                                resourceGroup: "classic",
                                resourceType: infoData.meteredService,
                                resourceName: infoData.project,
                                usageStartTime: new Date(useSegmentArr[i].properties.usageStartTime),
                                usageEndTime: new Date(useSegmentArr[i].properties.usageEndTime),
                                meterId: useSegmentArr[i].properties.meterId,
                                quantity: useSegmentArr[i].properties.quantity,
                                reportedStartTime: new Date(rST),
                                reportedEndTime: new Date(rET)
                            }, {upsert: true}, function (err, usageItem) {
                                if (err) {
                                    console.log(err, usageItem);
                                }
                            });
                    } else {
                        // handle arm data
                        var instDataJson = JSON.parse(instData);
                        var resourceUri = instDataJson["Microsoft.Resources"].resourceUri;
                        var uriArr = resourceUri.split("/");
                        var rG, rT, rN = uriArr[uriArr.length - 1];
                        for (var j = 1; j < uriArr.length; j++) {
                            if (uriArr[j-1].toLowerCase() === "resourcegroups")
                                rG = uriArr[j];
                            else if (uriArr[j-1].toLowerCase() === "providers")
                                rT = uriArr[j] + "/" + uriArr[j+1];
                        }

                        HU.update({
                                subscriptionId: subItem.subscriptionId,
                                resourceGroup: rG,
                                resourceType: rT,
                                resourceName: rN,
                                usageStartTime: new Date(useSegmentArr[i].properties.usageStartTime),
                                usageEndTime: new Date(useSegmentArr[i].properties.usageEndTime),
                                meterId: useSegmentArr[i].properties.meterId
                            },
                            {
                                subscriptionId: subItem.subscriptionId,
                                resourceGroup: rG,
                                resourceType: rT,
                                resourceName: rN,
                                usageStartTime: new Date(useSegmentArr[i].properties.usageStartTime),
                                usageEndTime: new Date(useSegmentArr[i].properties.usageEndTime),
                                meterId: useSegmentArr[i].properties.meterId,
                                quantity: useSegmentArr[i].properties.quantity,
                                reportedStartTime: new Date(rST),
                                reportedEndTime: new Date(rET)
                            }, {upsert: true}, function (err, usageItem) {
                                if (err) console.log(err, usageItem);
                            });
                    }
                }
                console.log("\tPage #" + nPage + " done:", "total:", useSegmentArr.length, "invalid:", nInvalidData);
                cb(null);
            });
        }

        async.doWhilst(
            getAggregatedUsageHelper,
            function () {
                return cToken != '';
            },
            function (err) {
                if (err) {
                    console.log("async doWhilst err", err);
                }
                console.log("\tFinish get usage.");
            }
        );

    }).on('error', function (err) {
        console.log("\tFail to get usageItem", err);
    }).on('close', function (){
        // console.log("\tfinish updating usage on all subscriptions");
    });
};