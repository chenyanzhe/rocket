module.exports.getSubscriptionList = function () {
    var request = require("request");
    var mongoose = require('mongoose');
    var Sub = mongoose.model('Subscription');

    var options = {
        method: 'GET',
        url: 'https://management.azure.com/subscriptions',
        qs: {'api-version': '2015-01-01'},
        headers: {
            'cache-control': 'no-cache',
            authorization: global.access_token,
            'content-type': 'application/json'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var subsArr = JSON.parse(body).value;
        for (var i = 0; i < subsArr.length; i++) {
            Sub.update(
            { id: subsArr[i].id }, {
                id: subsArr[i].id,
                    subscriptionId: subsArr[i].subscriptionId,
                displayName: subsArr[i].displayName,
                state: subsArr[i].state
            }, { upsert: true }, function (err, subscription) {
                if (err) {
                    console.log(err);
                    console.log(subscription);
                } else {
                    console.log("\tsubscription updated", subscription);
                }
            });
        }
    });
};