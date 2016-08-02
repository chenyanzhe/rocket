var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.vmList = function(req, res) {
    var async = require('async');
    var request = require("request");
    var vms = [];

    var options = {
        method: 'GET',
        url: 'https://management.azure.com/subscriptions/' + global.subscriptionId + '/resources',
        qs:
        {
            'api-version': '2015-01-01',
            '$filter': ''
        },
        headers:
        {
            'cache-control': 'no-cache',
            authorization: global.access_token
        }
    };

    async.series([
        function (callback) {
            options.qs['$filter'] = 'resourceType eq \'Microsoft.Compute/virtualMachines\'';
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                callback(null, JSON.parse(body).value);
            })
        },
        function (callback) {
            options.qs['$filter'] = 'resourceType eq \'Microsoft.ClassicCompute/virtualMachines\'';
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                callback(null, JSON.parse(body).value);
            })
        }
    ], function (err, result) {
        if (err) {
            sendJSONresponse(res, 404, err);
        } else {
            vms = result[0].concat(result[1]);
            sendJSONresponse(res, 200, vms);
        }
    });
};

module.exports.vmUsage = function(req, res) {
    var locs = req.params.location.split('&');
    var request = require("request");
    var async = require('async');
    var retObj = {};
    async.each(locs, function (loc, callback) {
        var options = {
            method: 'GET',
            url: 'https://management.azure.com/subscriptions/' + global.subscriptionId + '/providers/Microsoft.Compute/locations/' + loc + '/usages',
            qs: { 'api-version': '2015-06-15' },
            headers: {
                'cache-control': 'no-cache',
                authorization: global.access_token
            }
        };
        request(options, function (error, response, body) {
            if (error) callback(error);
            else {
                retObj[loc] = JSON.parse(body).value;
                callback();
            }
        });
    }, function (err) {
        if (err) sendJSONresponse(res, 404, err);
        else {
            sendJSONresponse(res, 200, retObj);
        }
    });
};

function getFilesWithExtension(srcPath, extName) {
  var fs = require('fs');
  var path = require('path');

  var fileList = fs.readdirSync(srcPath).filter(function(file) {
    var absPath = path.join(srcPath, file);
    var fstats = fs.statSync(absPath);
    return fstats.isFile() && path.extname(absPath) === extName;
  })

  var ret = [];
  for (var i = 0; i < fileList.length; i++) {
    ret.push({
      "name": fileList[i]
    })
  }
  return ret;
}

module.exports.vhdList = function(req, res) {
  var fileList = getFilesWithExtension('uploads/', '.vhd');
  console.log(fileList);
  sendJSONresponse(res, 200, fileList);
};

module.exports.vhdUpload = function(req, res) {
  var path = require('path');
  var localpath = path.join(__dirname, '../../', 'uploads/', req.params.localpath)
  var params = [{name: "localFilePath", value: localpath}];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/upload_vhd.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        console.log("upload_vhd started");
        console.log(Date.now());
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        var feedback = JSON.parse(data.output);
        if (feedback.code == false) {
          console.log("upload_vhd execute fail");
          console.log(Date.now());
          sendJSONresponse(res, 404, feedback.output);
        } else {
          console.log("upload_vhd execute success");
          console.log(Date.now());
          sendJSONresponse(res, 200, "upload success");
        }
      } else {
        console.log("node subprocess abort");
        sendJSONresponse(res, 404, "node subprocess abort");
      }
    })
    .catch(function(err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
    });

  // setTimeout(function(){
  //   sendJSONresponse(res, 200, staticData);
  // }, 2000);
};

module.exports.imgList = function(req, res) {
  var params = [];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/get_img_list.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        console.log("get_img_list started");
        console.log(Date.now());
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        var feedback = JSON.parse(data.output);
        if (feedback.code == false) {
          console.log("get_img_list execute fail");
          console.log(Date.now());
          sendJSONresponse(res, 404, feedback.output);
        } else {
          console.log("get_img_list execute success");
          console.log(Date.now());
          sendJSONresponse(res, 200, feedback.output);
        }
      } else {
        console.log("node subprocess abort");
        sendJSONresponse(res, 404, "node subprocess abort");
      }
    })
    .catch(function(err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
    });

  // setTimeout(function(){
  //   sendJSONresponse(res, 200, staticData);
  // }, 2000);
};