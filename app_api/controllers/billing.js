var mongoose = require('mongoose');
var moment = require('moment');

var RC = mongoose.model('RateCard');
var HU = mongoose.model('HourlyUsage');

var sendJSONResponse = function(res, status, content) {
	res.status(status);
    res.json(content);
};

var printed = false;
// prepare: name, rgName, type, cost
module.exports.lastWeek = function(request, response) {
    var billingInfo = [];
    var rST = moment().startOf('week').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    var rET = moment().startOf('day').utc().format("YYYY-MM-DDThh:mm:ssZ").toString();
    console.log("\t" + rST + " - " + rET);
    var usageCursor = HU.aggregate(
        { $match: { usageStartTime: { $gte: rST}}}
    ).cursor({ batchSize: 1000 }).exec();
    usageCursor.each(function (error, doc) {
        console.log(doc);
    });

    sendJSONResponse(response, 200, "OK");
};

/*
db.usages.find({
    usageStartTime : { "$gte" : ISODate("2016-07-25T00:00:00Z"), "$lt" : ISODate("2016-07-25T01:00:00Z") }
});
*/