module.exports.getRateCardList = function () {
    var request = require("request");
    var mongoose = require('mongoose');
    var winston = require('winston');
    var Sub = mongoose.model('Subscription');
    var RC = mongoose.model('RateCard');

    var subCursor = Sub.find().cursor();

    subCursor.on('data', function (subItem) {
        var options = {
            method: 'GET',
            url: 'https://management.azure.com/subscriptions/' + subItem.subscriptionId + '/providers/Microsoft.Commerce/RateCard',
            qs: {
                'api-version': '2015-06-01-preview',
                '$filter': 'OfferDurableId eq \'MS-AZR-0015P\' and Currency eq \'USD\' and Locale eq \'en-US\' and RegionInfo eq \'US\''
            },
            headers: {
                'cache-control': 'no-cache',
                authorization: global.access_token,
                'content-type': 'application/json'
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                winston.log('error', '[RateCard] Get RateCard job error %s', error);
            } else {
                var metersArr = JSON.parse(body).Meters;
                for (var i = 0; i < metersArr.length; i++) {
                    RC.update(
                        {subscriptionId: subItem.subscriptionId, MeterId: metersArr[i].MeterId},
                        {
                            subscriptionId: subItem.subscriptionId,
                            MeterId: metersArr[i].MeterId,
                            MeterName: metersArr[i].MeterName,
                            MeterCategory: metersArr[i].MeterCategory,
                            MeterSubCategory: metersArr[i].MeterSubCategory,
                            MeterRegion: metersArr[i].MeterRegion,
                            MeterRates: metersArr[i].MeterRates["0"],
                            Unit: metersArr[i].Unit,
                            EffectiveDate: metersArr[i].EffectiveDate,
                            IncludedQuantity: metersArr[i].IncludedQuantity
                        }, {upsert: true}, function (err, rateCardItem) {
                            if (err) {
                                winston.log('error', '[RateCard] Update RateCard table error %s', err);
                            }
                        });
                }
                winston.log('info', '[RateCard] RateCard for subscription %s is updated', subItem.displayName);
            }
        });

    }).on('error', function (err) {
        winston.log('error', '[RateCard] Subscription table iteration error %s', err);
    }).on('close', function () {
        winston.log('info', '[RateCard] Finish iterating subscription table');
    });
};