require('dotenv').load();

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Setup MongoDB
 */

var mongoose = require('mongoose');

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
var gracefulShutdown = function(msg, callback) {
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

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Setup background jobs
 */

var CronJob = require('cron').CronJob;

function startTokenJob() {
    var tokenWorker = require('./token').getAccessToken;
    var tokenJob = new CronJob({
        cronTime: '0 */30 * * * *', // run every 30 minutes
        onTick: function () {
            console.log('INIT: tokenJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            tokenWorker();
        },
        start: true
    });
}

function startSubscriptionJob() {
    var subscriptionWorker = require('./subscription').getSubscriptionList;
    var subscriptionJob = new CronJob({
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function () {
            console.log('INIT: subscriptionJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            subscriptionWorker();
        },
        start: true
    });
}

function startRateCardJob() {
    var rateCardWorker = require('./ratecard').getRateCardList;
    var rateCardJob = new CronJob({
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function () {
            console.log('INIT: rateCardJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            rateCardWorker();
        },
        start: true
    });
}

function startHourlyUsageJob() {
    var hourlyUsageWorker = require('./usage').getHourlyUsage;
    var hourlyUsageJob = new CronJob({
        // cronTime: '0 30 * * * *', // run on **:30:00
        cronTime: '0 0 0 */1 * *', // run every day
        onTick: function () {
            console.log('INIT: hourlyUsageJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            hourlyUsageWorker();
        },
        // runOnInit: true,
        start: true
    });
}

function startDailyUsageJob() {
    var dailyUsageWorker = require('./usage').getDailyUsage;
    var dailyUsageJob = new CronJob({
        cronTime: '0 0 23 * * *', // run on 23:00:00
        onTick: function() {
            console.log('INIT: dailyUsageJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
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
            console.log('INIT: dailyCostJob started!');
            var moment = require('moment');
            var rST = moment().format("YYYY-MM-DDThh:mm:ssZ").toString();
            console.log("\t" + rST);
            dailyCostWorker();
        },
        runOnInit: true,
        start: true
    })
}

/* ----------------------------------------------------------------------------------------------------------------*/

/*
 * Launcher
 */

function connectDB(callback) {
    console.log("INIT: connecting db ...");
    mongoose.connect(process.env.DB_URI);

    // CONNECTION EVENTS
    mongoose.connection.on('connected', function() {
        console.log('\tMongoose connected to ' + process.env.DB_URI);
        callback(null);
    });
    mongoose.connection.on('error', function(err) {
        console.log('\tMongoose connection error: ' + err);
    });
    mongoose.connection.on('disconnected', function() {
        console.log('\tMongoose disconnected');
    });
}

function setupSchema(callback) {
    console.log("INIT: setting up schema ...");
    require('../models/subscription');
    require('../models/ratecard');
    require('../models/usage');
    require('../models/cost');
    callback(null);
}

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
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        }
    };

    request(options, function (err, res, body) {
        if (err) throw new Error(err);
        // TODO: handle exceptions here
        var ret = JSON.parse(body);
        global.access_token = ret.token_type + " " + ret.access_token;
        console.log("INIT: access token is ready!");
        callback(null);
    });
}

function startCronJobs(callback) {
    console.log("INIT: start cron jobs!");
    startTokenJob();
    startSubscriptionJob();
    startRateCardJob();
    startHourlyUsageJob();
    startDailyUsageJob();
    startDailyCostJob();
    callback(null);
}

var async = require('async');
async.series([
    connectDB,
    setupSchema,
    getAccessToken,
    startCronJobs
], function (err) {
    if (err) throw new Error(err);
});