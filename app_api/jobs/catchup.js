var request = require("request");
var mongoose = require('mongoose');
var winston = require('winston');
var moment = require('moment');
var async = require('async');
var Sub = mongoose.model('Subscription');
var DU = mongoose.model('DailyUsage');
var DC = mongoose.model('DailyCost');

var existingTimes = [];
var missingTimes = [];
var existingCosts = [];
var missingCosts = [];

module.exports.catchUp = function (callback) {
    var async = require('async');
    async.series([
        fetchExistingTimes,
        findMissingTimes,
        fetchMissingUsage,
        fetchExistingCosts,
        findMissingCosts,
        calcMissingCosts
    ], function (err) {
        if (err) {
            winston.log('error', '[Catchup] Catch up jobs error %s', err);
            callback(err);
        } else {
            winston.log('info', '[Catchup] Finish launching all catch up jobs');
            callback();
        }
    });
};

var fetchExistingTimes = function (cb) {
    var usageCursor = DU.aggregate([
        {
            $group: {
                _id: { reportedStartTime: "$reportedStartTime", reportedEndTime: "$reportedEndTime" }
            }
        },
        {
            $project: {
                _id: 0, reportedStartTime: "$_id.reportedStartTime", reportedEndTime: "$_id.reportedEndTime"
            }
        },
        { $sort: { reportedStartTime: 1 } }
    ]).cursor({ batchSize: 1000 }).exec();



    usageCursor.each(function(error, item) {
        if (error) {
            winston.log('error', '[Catchup] Fetching existing time periods error %s', error);
            cb(error);
        } else if (item) {
            existingTimes.push({StartTime: moment(item.reportedStartTime).utc(), EndTime: moment(item.reportedEndTime).utc()});
            var startTime = moment(item.reportedStartTime).utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
            var endTime = moment(item.reportedEndTime).utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
            winston.log('info', '[Catchup] StartTime: %s, EndTime: %s', startTime, endTime);
        } else {
            winston.log('info', '[Catchup] Finish fetching existing time periods, size = %d', existingTimes.length);
            cb();
        }
    });
};

var findMissingTimes = function (cb) {
    // This is the earliest date providing usage data
    var defaultStartTime = moment("2015-03-04T00:00:00+00:00");
    var currentTime = moment().utc().startOf('day');

    if (defaultStartTime.isBefore(existingTimes[0].StartTime)) {
        missingTimes.push({StartTime: defaultStartTime, EndTime: existingTimes[0].StartTime});
    }
    for (var i = 1; i < existingTimes.length; i++) {
        if (existingTimes[i-1].EndTime.isBefore(existingTimes[i].StartTime)) {
            missingTimes.push({StartTime: existingTimes[i-1].EndTime, EndTime: existingTimes[i].StartTime});
        }
    }
    if (existingTimes[existingTimes.length - 1].EndTime.isBefore(currentTime)) {
        missingTimes.push({StartTime: existingTimes[existingTimes.length - 1].EndTime, EndTime: currentTime});
    }
    winston.log('info', '[Catchup] Finish finding missing time periods, size = %d', missingTimes.length);
    cb();
};

var findMissingCosts = function (cb) {
    // This is the earliest date providing usage data
    var defaultStartTime = moment("2015-03-04T00:00:00+00:00");
    var currentTime = moment().utc().startOf('day');

    if (defaultStartTime.isBefore(existingCosts[0].StartTime)) {
        missingCosts.push({StartTime: defaultStartTime, EndTime: existingCosts[0].StartTime});
    }
    for (var i = 1; i < existingCosts.length; i++) {
        if (existingCosts[i-1].EndTime.isBefore(existingCosts[i].StartTime)) {
            missingCosts.push({StartTime: existingCosts[i-1].EndTime, EndTime: existingCosts[i].StartTime});
        }
    }
    if (existingCosts[existingCosts.length - 1].EndTime.isBefore(currentTime)) {
        missingCosts.push({StartTime: existingCosts[existingCosts.length - 1].EndTime, EndTime: currentTime});
    }
    winston.log('info', '[Catchup] Finish finding missing costs periods, size = %d', missingCosts.length);
    cb();
};

var fetchExistingCosts = function (cb) {
    var costsCursor = DC.aggregate([
        {
            $group: {
                _id: { usageStartTime: "$usageStartTime", usageEndTime: "$usageEndTime" }
            }
        },
        {
            $project: {
                _id: 0, usageStartTime: "$_id.usageStartTime", usageEndTime: "$_id.usageEndTime"
            }
        },
        { $sort: { usageStartTime: 1 } }
    ]).cursor({ batchSize: 1000 }).exec();



    costsCursor.each(function(error, item) {
        if (error) {
            winston.log('error', '[Catchup] Fetching existing costs periods error %s', error);
            cb(error);
        } else if (item) {
            existingCosts.push({StartTime: moment(item.usageStartTime).utc(), EndTime: moment(item.usageEndTime).utc()});
        } else {
            winston.log('info', '[Catchup] Finish fetching existing costs periods, size = %d', existingCosts.length);
            cb();
        }
    });
};

var fetchMissingUsage = function (cb) {
    async.map(missingTimes, getDailyUsage, function (err, results) {
        if (err) {
            winston.log('error', '[Catchup] Fetch missing usage error', err);
            cb(err);
        } else {
            winston.log('info', '[Catchup] Finish fetching missing usage');
            cb();
        }
    });
};

var calcMissingCosts = function (cb) {
    async.map(missingCosts, getDailyCosts, function (err, results) {
        if (err) {
            winston.log('error', '[Catchup] Calculate missing costs error', err);
            cb(err);
        } else {
            winston.log('info', '[Catchup] Finish calculating missing costs');
            cb();
        }
    })
};

var getDailyUsage = function (ts, cbi) {

    var rST = ts.StartTime.format("YYYY-MM-DDTHH:mm:ssZ").toString();
    var rET = ts.EndTime.format("YYYY-MM-DDTHH:mm:ssZ").toString();

    winston.log('info', '[Catchup] Getting daily usage from %s to %s', rST, rET);

    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var cToken = '';
        var nPage = 0;
        function getAggregatedUsageHelper(cbj) {

            var options = { method: 'GET',
                url: 'https://management.azure.com/subscriptions/' + subItem.subscriptionId + '/providers/Microsoft.Commerce/UsageAggregates',
                qs: {
                    'api-version': '2015-06-01-preview',
                    reportedStartTime: rST,
                    reportedEndTime: rET,
                    aggregationGranularity: 'Daily',
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
                if (error) {
                    winston.log('error', '[Catchup] Get daily usage error', error);
                    cbj(error);
                    return;
                }
                var usageSegment;
                try {
                    usageSegment = JSON.parse(body);
                } catch (e) {
                    winston.log('error', '[Catchup] Parsing usage body error', e);
                    // retry
                    cbj();
                    return;
                }
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
                        DU.update({
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
                                    winston.log('error', '[Catchup] Update DailyUsage table for CLASSIC error', err);
                                    cbj(err);
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

                        DU.update({
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
                                if (err) {
                                    winston.log('error', '[Catchup] Update DailyUsage table for ARM error', err);
                                    cbj(err);
                                }
                            });
                    }
                }
                winston.log('info', "[Catchup] \tDailyUsage Page #" + nPage + " done:", "total:", useSegmentArr.length, "invalid:", nInvalidData);
                cbj();
            });
        }

        async.doWhilst(
            getAggregatedUsageHelper,
            function () {
                return cToken != '';
            },
            function (err) {
                if (err) {
                    winston.log('error', '[Catchup] Iterating Usage Pages error', err);
                    cbi(err);
                } else {
                    winston.log('info', '[Catchup] Finish getting daily usage');
                    cbi();
                }
            }
        );

    }).on('error', function (err) {
        winston.log('error', '[Catchup] Subscription iteration for daily usage error', err);
        cbi(err);
    }).on('close', function () {
        winston.log('info', '[Catchup] Finish iterating all subscriptions for daily usage');
    });
};

var getDailyCosts = function (ts, cbi) {
    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var startDay = ts.StartTime;
        var endDay = ts.EndTime;
        var nDays = 0;

        winston.log('info', '[Catchup] Getting daily costs from %s to %s',
            startDay.format("YYYY-MM-DDTHH:mm:ssZ").toString(),
            endDay.format("YYYY-MM-DDTHH:mm:ssZ").toString());

        function getDailyCostHelper(cbj) {
            var startTime = new Date(startDay.format("YYYY-MM-DDTHH:mm:ssZ").toString());
            startDay.add(1, 'day');
            var endTime = new Date(startDay.format("YYYY-MM-DDTHH:mm:ssZ").toString());
            winston.log('verbose', '[Catchup] \t Calculating daily costs from %s to %s', startTime, endTime);
            var costCursor = DU.aggregate([
                {
                    $match: { usageStartTime: { $gte: startTime, $lt: endTime } }
                },
                {
                    $lookup: { from: "ratecards", localField: "meterId", foreignField: "MeterId", as: "ratecard" }
                },
                {
                    $unwind: "$ratecard"
                },
                {
                    $group: {
                        _id: { resourceGroup: "$resourceGroup", resourceName: "$resourceName", resourceType: "$resourceType" },
                        totalPrice: { $sum: { $multiply: [ "$quantity", "$ratecard.MeterRates" ] } }
                    }
                },
                {
                    $project: {
                        _id: 0, resourceGroup: "$_id.resourceGroup", resourceName: "$_id.resourceName", resourceType: "$_id.resourceType", totalPrice: 1
                    }
                },
                {
                    $sort: { totalPrice: -1 }
                }
            ]).cursor({ batchSize: 1000 }).exec();

            costCursor.each(function(error, doc) {
                if (error) {
                    winston.log('error', '[Catchup] \t Daily costs iterator cursor error', error);
                    cbj(error);
                } else if (doc) {
                    DC.update({
                            subscriptionId: subItem.subscriptionId,
                            resourceGroup: doc.resourceGroup,
                            resourceType: doc.resourceType,
                            resourceName: doc.resourceName,
                            usageStartTime: startTime,
                            usageEndTime: endTime
                        },
                        {
                            subscriptionId: subItem.subscriptionId,
                            resourceGroup: doc.resourceGroup,
                            resourceType: doc.resourceType,
                            resourceName: doc.resourceName,
                            usageStartTime: startTime,
                            usageEndTime: endTime,
                            cost: doc.totalPrice
                        }, {upsert: true}, function (err, costItem) {
                            if (err) {
                                winston.log('error', '[Catchup] \t Daily costs table update error', err);
                                cbj(error);
                            }
                        });
                } else {
                    winston.log('verbose', '[Catchup] \t Updated daily costs from %s to %s', startTime, endTime);
                    nDays++;
                    cbj();
                }
            });
        }

        async.doWhilst(
            getDailyCostHelper,
            function () {
                return startDay.isBefore(endDay);
            },
            function (err) {
                if (err) {
                    winston.log('error', '[Catchup] Daily costs async iteration error', err);
                    cbi(err);
                } else {
                    winston.log('info', '[Catchup] Updated daily costs');
                    cbi();
                }
            }
        );

    }).on('error', function (err) {
        winston.log('error', '[Catchup] Subscription iteration for daily costs error', err);
    }).on('close', function () {
        winston.log('info', '[Catchup] Finish iterating all subscriptions for daily costs');
    });
};