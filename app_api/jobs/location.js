module.exports.getLocationList = function () {
    var request = require("request");
    var mongoose = require('mongoose');
    var winston = require('winston');
    var Sub = mongoose.model('Subscription');
    var Loc = mongoose.model('Location');

    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {

        var options = { method: 'GET',
            url: 'https://management.azure.com/subscriptions/' + subItem.subscriptionId + '/locations',
            qs: { 'api-version': '2015-01-01' },
            headers: {
                'cache-control': 'no-cache',
                'x-ms-version': '2015-04-01',
                authorization: global.access_token
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                winston.log('error', '[Location] Get Location job error %s', error);
            } else {
                var locArr = JSON.parse(body).value;
                for (var i = 0; i < locArr.length; i++) {
                    Loc.update(
                        { name: locArr[i].name },
                        {
                            id: locArr[i].id,
                            name: locArr[i].name,
                            displayName: locArr[i].displayName,
                            longitude: locArr[i].longitude,
                            latitude: locArr[i].latitude
                        }, { upsert: true }, function (err, locItem) {
                            if (err) {
                                winston.log('error', '[Location] Update Location table error %s', err);
                            }
                        });
                }
                winston.log('info', '[Location] Location for subscription %s is updated', subItem.displayName);
            }
        });

    }).on('error', function (err) {
        winston.log('error', '[Location] Subscription table iteration error %s', err);
    }).on('close', function (){
        winston.log('info', '[Location] Finish iterating subscription table');
    });
};
