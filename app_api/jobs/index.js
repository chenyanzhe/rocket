// create a bunch of jobs here
var tokenWorker = require('./token');

var CronJob = require('cron').CronJob;

var tokenJob = new CronJob('*/10 * * * * *', function() {
        console.log('tokenJob started!');
        tokenWorker.getAccessToken();
    }, function () {
        console.log('tokenJob stopped!');
    },
    true /* Start the job right now */
);

module.exports.getJobs = function () {
    return [tokenJob];
};