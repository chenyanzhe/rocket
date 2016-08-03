module.exports.getAccessToken = function () {
    var request = require("request");
    var winston = require('winston');

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
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        }
    };

    request(options, function (err, res, body) {
        if (err) {
            winston.log('error', '[Token] Get access token job error %s', err);
        } else {
            var ret = JSON.parse(body);
            global.access_token = ret.token_type + " " + ret.access_token;
            winston.log('info', '[Token] Access token is updated');
        }
    });
};
