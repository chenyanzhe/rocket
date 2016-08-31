var mongoose = require('mongoose');
var moment = require('moment');

var DC = mongoose.model('DailyCost');

var sendJSONResponse = function(res, status, content) {
	res.status(status);
    res.json(content);
};

var printed = false;
// prepare: name, rgName, type, cost
module.exports.lastWeek = function(request, response) {
    var billingInfo = [];
    if (mongoose.connection.readyState !== 1) {
        sendJSONResponse(response, 200, billingInfo);
        return;
    }

    var rST = request.params.start;
    var rET = request.params.end;
    console.log("\t" + rST + " - " + rET);
    var costCursor = DC.aggregate([
        { $match:
            {
                subscriptionId: global.subscriptionId,
                usageStartTime: { $gte: new Date(rST), $lt: new Date(rET) }
            }
        },
        { $group: {
            _id: { resourceGroup: "$resourceGroup", resourceType: "$resourceType", resourceName: "$resourceName" },
            totalCost: { $sum: "$cost" }
        }
        },
        { $project:
        { _id: 0, resourceGroup: "$_id.resourceGroup", resourceName: "$_id.resourceName", resourceType: "$_id.resourceType", totalCost: 1 }
        },
        { $sort: { totalCost: -1 } }
    ]).cursor({ batchSize: 1000 }).exec();

    costCursor.each(function(error, doc) {
        if (error) {
            console.log(error);
            sendJSONResponse(response, 404, error);
        } else if (doc) {
            billingInfo.push(doc);
        } else {
            sendJSONResponse(response, 200, billingInfo);
        }
    });
};
