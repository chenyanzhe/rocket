module.exports.getDailyCost = function () {
    var request = require("request");
    var async = require('async');
    var moment = require('moment');
    var mongoose = require('mongoose');
    var Sub = mongoose.model('Subscription');
    var DU = mongoose.model('DailyUsage');
    var DC = mongoose.model('DailyCost');

    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var startDay = moment('2016-04-01T00:00:00+00:00');
        var endDay = moment('2016-06-02T00:00:00+00:00');
        var nDays = 0;
        var errorHappens = false;

        function getDailyCostHelper(cb) {
            var startTime = new Date(startDay.format("YYYY-MM-DDThh:mm:ssZ").toString());
            startDay.add(1, 'days');
            var endTime = new Date(startDay.format("YYYY-MM-DDThh:mm:ssZ").toString());
            console.log("\t", startTime.toDateString(), endTime.toDateString());
            var costCursor = DU.aggregate([
                { $match:
                    { usageStartTime: { $gte: startTime, $lt: endTime } }
                },
                { $lookup:
                    { from: "ratecards", localField: "meterId", foreignField: "MeterId", as: "ratecard" }
                },
                { $unwind: "$ratecard" },
                { $group: {
                    _id: { resourceGroup: "$resourceGroup", resourceName: "$resourceName", resourceType: "$resourceType" },
                    totalPrice: { $sum: { $multiply: [ "$quantity", "$ratecard.MeterRates" ] } }
                    }
                },
                { $project:
                    { _id: 0, resourceGroup: "$_id.resourceGroup", resourceName: "$_id.resourceName", resourceType: "$_id.resourceType", totalPrice: 1 }
                },
                { $sort: { totalPrice: -1 } }
            ]).cursor({ batchSize: 1000 }).exec();

            // db.dailyusages.aggregate([{$group: {_id: {reportedStartTime: "$reportedStartTime", reportedEndTime: "$reportedEndTime"}}}, {$project: {_id: 0, reportedStartTime: "$_id.reportedStartTime", reportedEndTime: "$_id.reportedEndTime"}}, {$sort: {reportedStartTime: 1}}])

            costCursor.each(function(error, doc) {
                if (error) {
                    console.log(error);
                    errorHappens = true;
                    cb(null);
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
                                console.log(err);
                                errorHappens = true;
                                cb(null);
                            }
                        });
                } else {
                    console.log("\tDay " + nDays + " Done!");
                    nDays++;
                    cb(null);
                }
            });
        }

        async.doWhilst(
            getDailyCostHelper,
            function () {
                return !errorHappens && startDay.isBefore(endDay);
            },
            function (err) {
                if (err) {
                    console.log("async doWhilst err", err);
                }
                console.log("\tFinish get cost.");
            }
        );

    }).on('error', function (err) {
        console.log("\tFail to get costItem", err);
    }).on('close', function (){
        // console.log("\tfinish updating usage on all subscriptions");
    });
};