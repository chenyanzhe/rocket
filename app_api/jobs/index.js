require('dotenv').load();
var winston = require('winston');
var moment = require('moment');
winston
    .add(winston.transports.File, {
        name: 'jobs-info',
        filename: 'logs/jobs-info.log',
        level: 'info',
        timestamp: function () {
            return moment().format("YYYY-MM-DDTHH:mm:ss").toString();
        }
    })
    .add(winston.transports.File, {
        name: 'jobs-error',
        filename: 'logs/jobs-error.log',
        level: 'error',
        timestamp: function () {
            return moment().format("YYYY-MM-DDTHH:mm:ss").toString();
        }
    })
    .remove(winston.transports.Console)
    .add(winston.transports.Console, {
        colorize: true,
        timestamp: function () {
            return moment().format("YYYY-MM-DDTHH:mm:ss").toString();
        }
    });

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Setup MongoDB
 */

var mongoose = require('mongoose');

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
var gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        winston.log('info', '[INIT] Mongoose disconnected through %s', msg);
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

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Setup background jobs
 */

var CronJob = require('cron').CronJob;

function startTokenJob(callback) {
    var tokenWorker = require('./token').getAccessToken;
    var tokenJob = new CronJob({
        cronTime: '0 */30 * * * *', // run every 30 minutes
        onTick: function () {
            winston.log('info', '[Token] Token job activated');
            tokenWorker();
        },
        start: true
    });
    callback();
}

function startSubscriptionJob(callback) {
    var subscriptionWorker = require('./subscription').getSubscriptionList;
    var subscriptionJob = new CronJob({
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function () {
            winston.log('info', '[Subscription] Subscription job activated');
            subscriptionWorker();
        },
        runOnInit: true,
        start: true
    });
    callback();
}

function startRateCardJob(callback) {
    var rateCardWorker = require('./ratecard').getRateCardList;
    var rateCardJob = new CronJob({
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function () {
            winston.log('info', '[RateCard] RateCard job activated');
            rateCardWorker();
        },
        runOnInit: true,
        start: true
    });
    callback();
}

function startLocationJob(callback) {
    var locationWorker = require('./location').getLocationList;
    var locationJob = new CronJob({
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function() {
            winston.log('info', '[Location] Location job activated');
            locationWorker();
        },
        runOnInit: true,
        start: true
    });
    callback();
}

function catchUpJob(callback) {
    var catchUpWorker = require('./catchup').catchUp;
    catchUpWorker(callback);
}

function startDailyUsageJob() {
    var dailyUsageWorker = require('./usage').getDailyUsage;
    var dailyUsageJob = new CronJob({
        cronTime: '0 0 23 * * *', // run on 23:00:00
        onTick: function() {
            winston.log('info', 'DailyUsage job activated');
            dailyUsageWorker();
        },
        // runOnInit: true,
        start: true
    })
}

function startDailyCostJob() {
    var dailyCostWorker = require('./cost').getDailyCost;
    var dailyCostJob = new CronJob({
        cronTime: '0 0 23 * * *', // run on 23:00:00
        onTick: function() {
            winston.log('info', 'DailyCost job activated');
            dailyCostWorker();
        },
        // runOnInit: true,
        start: true
    })
}

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Launcher
 */

function connectDB(callback) {
    winston.log('info', '[INIT] Mongoose connecting to %s', process.env.DB_URI);
    mongoose.connect(process.env.DB_URI);

    // CONNECTION EVENTS
    mongoose.connection.on('connected', function() {
        winston.log('info', '[INIT] Mongoose connected to %s', process.env.DB_URI);
        callback(null);
    });
    mongoose.connection.on('error', function(err) {
        winston.log('error', '[INIT] Mongoose connection error %s', err);
    });
    mongoose.connection.on('disconnected', function() {
        winston.log('info', '[INIT] Mongoose disconnected');
    });
}

function setupSchema(callback) {
    winston.log('info', '[INIT] Setting up schemas');
    require('../models/subscription');
    require('../models/ratecard');
    require('../models/usage');
    require('../models/cost');
    require('../models/location');
    callback(null);
}

function getAccessToken(callback) {
    winston.log('info', '[INIT] Get access token for the first time');
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
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        }
    };

    request(options, function (err, res, body) {
        if (err) {
            winston.log('error', '[INIT] Get access token error %s', err);
        } else {
            var ret = JSON.parse(body);
            global.access_token = ret.token_type + " " + ret.access_token;
            winston.log('info', '[INIT] Access token is ready');
            callback(null);
        }
    });
}

var async = require('async');
async.series([
    connectDB,
    setupSchema,
    getAccessToken,
    startTokenJob,
    startSubscriptionJob,
    startRateCardJob,
    startLocationJob,
    catchUpJob
], function (err) {
    if (err) {
        winston.log('error', '[INIT] Serialize jobs error %s', err);
    } else {
        winston.log('info', '[INIT] Finish launching jobs');
    }
});