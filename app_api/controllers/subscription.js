var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.subList = function(request, response) {
    var fs = require('fs');
    var obj = global.configObj;
    obj["active"] = global.subscriptionId;
    sendJSONResponse(response, 200, obj);
};

module.exports.switchSub = function(req, response) {
    var subId = req.params.subid;
    // TDOO: validation
    global.subscriptionId = subId;
    console.log("SUBID SETTING TO", global.subscriptionId);

    for (var i = 0; i < global.configObj.subscriptions.length; i++) {
        if (global.configObj.subscriptions[i].id == subId) {
            global.clientId = global.configObj.subscriptions[i].clientId;
            global.clientSecret = global.configObj.subscriptions[i].clientSecret;
            console.log("Updated client id and secret");
        }
    }

    console.log("INIT: update access token ...");
    var request = require("request");

    var options = { method: 'POST',
        url: 'https://login.microsoftonline.com/microsoft.onmicrosoft.com/oauth2/token',
        qs: { 'api-version': '1.0' },
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form:
        {
            grant_type: 'client_credentials',
            resource: 'https://management.core.windows.net/',
            client_id: global.clientId,
            client_secret: global.clientSecret
        }
    };

    request(options, function (err, res, body) {
        if (err) throw new Error(err);
        var ret = JSON.parse(body);
        global.access_token = ret.token_type + " " + ret.access_token;
        sendJSONResponse(response, 200, "OK");
    });
};
