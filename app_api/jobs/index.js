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
        cronTime: '0 */31 * * * *', // run every 31 minutes
        onTick: function () {
            console.log('INIT: tokenJob started!');
            tokenWorker();
        },
        start: true
    });
}

function startSubscriptionJob() {
    var subscriptionWorker = require('./subscription').getSubscriptionList;
    var subscriptionJob = new CronJob({
        cronTime: '0 0 */59 * * *', // run every 59 minutes
        onTick: function () {
            console.log('INIT: subscriptionJob started!');
            subscriptionWorker();
        },
        start: true
    });
}

function startRateCardJob() {
    var rateCardWorker = require('./ratecard').getRateCardList;
    var rateCardJob = new CronJob({
        cronTime: '0 0 */2 * * *', // run every 2 hours
        onTick: function () {
            console.log('INIT: rateCardJob started!');
            rateCardWorker();
        },
        start: true
    });
}

function startUsageJob() {
    var usageWorker = require('./usage').getUsage;
    var usageJob = new CronJob({
        cronTime: '0 */2 * * * *', // run every 2 minutes
        onTick: function () {
            console.log('INIT: usageJob started!');
            usageWorker();
        },
        start: true,
        runOnInit: true
    });
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
    startUsageJob();
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