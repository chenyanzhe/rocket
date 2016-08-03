module.exports.catchUp = function (callback) {
    var request = require("request");
    var mongoose = require('mongoose');
    var winston = require('winston');
    var moment = require('moment');
    var Sub = mongoose.model('Subscription');
    var DU = mongoose.model('DailyUsage');

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
            winston.log('error', '[Catchup] Scanning time periods error %s', error);
            callback(error);
        } else if (item) {
            var startTime = moment(item.reportedStartTime).utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
            var endTime = moment(item.reportedEndTime).utc().format("YYYY-MM-DDTHH:mm:ssZ").toString();
            winston.log('info', '[Catchup] StartTime: %s, EndTime: %s', startTime, endTime);
        } else {
            winston.log('info', '[Catchup] Finish scanning all time periods');
            callback();
        }
    });
};
