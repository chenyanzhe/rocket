var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/rocket';

var jobs = require('../jobs/index');

mongoose.connect(dbURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
    for (var i = 0; i < jobs.getJobs().length; i++) {
        jobs.getJobs()[i].start();
    }
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
    for (var i = 0; i < jobs.getJobs().length; i++) {
        jobs.getJobs()[i].stop();
    }
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        for (var i = 0; i < jobs.getJobs().length; i++) {
            jobs.getJobs()[i].stop();
        }
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