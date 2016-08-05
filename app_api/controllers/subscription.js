var sendJSONResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.subList = function(request, response) {
    var fs = require('fs');
    var obj;
    fs.readFile('config.json', 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        obj = JSON.parse(data);
        sendJSONResponse(response, 200, obj);
    });
};

