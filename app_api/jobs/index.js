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
        name: 'jobs-warning',
        filename: 'logs/jobs-warn.log',
        level: 'warn',
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
 * Parse arguments
 */
var argv = require('minimist')(process.argv.slice(2));

var printUnknownWarnings = function(argv) {
    var unknowns = {};
    var found = false;
    Object.keys(argv).forEach(function(key, index) {
        if (key === '_') {
            if (argv[key].length > 0) {
                unknowns[key] = argv[key];
                found = true;
            }
        } else if (key !== 'id' && key !== 'secret' && key !== 'help') {
            unknowns[key] = argv[key];
            found = true;
        }
    });

    if (found) {
        Object.keys(unknowns).forEach(function(key, index) {
            if (key === '_') {
                var singles = unknowns[key][0];
                for (var i = 1; i < unknowns[key].length; i++)
                    singles += ', ' + unknowns[key];
                console.log('Unknown arguments:', singles);
            } else {
                console.log('Unknown arguement: --' + key);
            }
        })
        return;
    }
}

printUnknownWarnings(argv);

var parseArguments = function(argv) {
    var help = false, id = false, secret = false;
    Object.keys(argv).forEach(function(key, index) {
        if (key === 'help') {
            help = true;
        } else if (key === 'id') {
            id = true;
        } else if (key === 'secret') {
            secret = true;
        }
    });

    if (help) {
        console.log('Usage: node script.js --id <id> --secret <secret>');
        return false;
    } else if (id && secret) {
        global.client_id = argv.id;
        global.client_secret = argv.secret;
        return true;
    } else {
        if (!id && !secret) {
            console.log('Missing arguments: --id and --secret');
        } else if (!id) {
            console.log('Missing argument: --id');
        } else {
            console.log('Missing argument: --secret');
        }
        return false;
    }
};

if (!parseArguments(argv))
    return;

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
            client_id: global.client_id,
            client_secret: global.client_secret
        }
    };

    request(options, function (err, res, body) {
        if (err) {
            winston.log('error', '[INIT] Get access token error %s', err);
            callback(err);
        } else {
            var ret = JSON.parse(body);
            if (ret.error) {
                if (ret.error_description)
                    callback(ret.error_description);
                else
                    callback(ret.error);
            } else {
                global.access_token = ret.token_type + " " + ret.access_token;
                winston.log('info', '[INIT] Access token is ready');
                callback(null);
            }
        }
    });
}

function getSubscription(callback) {
    winston.log('info', '[INIT] Get subscription for the first time');
    var request = require("request");

    var options = { method: 'GET',
        url: 'https://management.azure.com/subscriptions',
        qs: { 'api-version': '2015-01-01' },
        headers:
        {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'authorization': global.access_token
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            winston.log('error', '[INIT] Get subscription error %s', error);
            callback(error);
        } else {
            var ret = JSON.parse(body);
            if (ret.error) {
                if (ret.error.message)
                    callback(ret.error.message);
                else
                    callback(ret.error);
            } else {
                global.subscriptionId = ret.value[0].subscriptionId;
                global.subscriptionName = ret.value[0].displayName;
                winston.log('info', '[INIT] Subscription is ready');
                callback(null);
            }
        }
    });
}

var async = require('async');
async.series([
    connectDB,
    setupSchema,
    getAccessToken,
    getSubscription,
    startTokenJob,
    startSubscriptionJob,
    catchUpJob,
    startRateCardJob,
    startLocationJob
], function (err) {
    if (err) {
        winston.log('error', '[INIT] Serialize jobs error %s', err);
    } else {
        winston.log('info', '[INIT] Finish launching jobs');
    }
});