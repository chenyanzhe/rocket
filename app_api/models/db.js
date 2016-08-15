require('dotenv').load();

var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = process.env.DB_URI;

//FIXME: subscription id should be set by user
global.subscriptionId = 'c4528d9e-c99a-48bb-b12d-fde2176a43b8';
//global.subscriptionId = '4be8920b-2978-43d7-ab14-04d8549c1d05';

mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});

// BRING IN SCHEMAS & MODELS
require('./location');
require('./ratecard');
require('./subscription');
require('./usage');
require('./cost');

function getConfig(callback) {
    var fs = require('fs');
    fs.readFile('config.json', 'utf8', function (err, data) {
        if (err) {
            callback(err);
        } else {
            var config = JSON.parse(data);
            if (config.subscriptions && config.subscriptions.length > 0) {
                // set the first one as the default subscription
                global.subscriptionId = config.subscriptions[0].id;
                global.clientId = config.subscriptions[0].clientId;
                global.clientSecret = config.subscriptions[0].clientSecret;

                global.configObj = config;
                callback(null);
            } else {
                callback("Failed to load config file.");
            }
        }
    });
};

function getAccessToken(callback) {
    console.log("INIT: access token is preparing ...");
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
        console.log("INIT: access token is ready!");
        callback(null);
    });
}

var getAccessTokenWorker = function () {
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
        console.log("access token updated!");
    });
};

var CronJob = require('cron').CronJob;

function startTokenJob(callback) {
    var tokenJob = new CronJob({
        cronTime: '0 */30 * * * *', // run every 30 minutes
        onTick: function () {
            console.log('INIT: tokenJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            getAccessTokenWorker();
        },
        start: true
    });
    callback(null);
}

var async = require('async');
async.series([
    getConfig,
    getAccessToken,
    startTokenJob
], function (err) {
    if (err) throw new Error(err);
});