var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* GET list of locations */
module.exports.locationList = function(req, res) {
    Loc
        .find()
        .exec(function(err, locations) {
            if (err) {
                console.log('locationList error: ', err);
                sendJsonResponse(res, 404, err);
            } else {
                sendJsonResponse(res, 200, locations);
            }
        });
};
